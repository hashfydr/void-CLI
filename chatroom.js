import { theme } from './utils/theme.js';
import readline from 'readline';
import ora from 'ora';
import {
    fetchInitialMessages,
    fetchPreviousMessages,
    submitMessage,
    subscribeToMessages,
    getCurrentUserId,
    subscribeToConnectionState,
} from './services/chatroomService.js';

const SEND_TIMEOUT_MS = 5000;

const formatMessage = (message) => {
    const username = message.authorUsername || 'Anonymous';
    const time =
        message.createdAt && message.createdAt.seconds
            ? new Date(message.createdAt.seconds * 1000).toLocaleString()
            : '';
    return `${theme.primary(time)} - ${theme.secondary(username)}: ${theme.text(message.text)}`;
};

/**
 * Wraps a promise with a timeout. Rejects if the promise
 * doesn't resolve within the specified milliseconds.
 */
const withTimeout = (promise, ms) => {
    return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
            reject(new Error(`Network timeout: operation did not complete within ${ms}ms`));
        }, ms);
        promise
            .then((val) => {
                clearTimeout(timer);
                resolve(val);
            })
            .catch((err) => {
                clearTimeout(timer);
                reject(err);
            });
    });
};

/**
 * Clears the current readline input line, prints output,
 * then redraws the user's partially-typed input so incoming
 * messages don't corrupt what the user is typing.
 */
const safePrint = (rl, text) => {
    // Move cursor to column 0, clear the entire line
    readline.cursorTo(process.stdout, 0);
    readline.clearLine(process.stdout, 0);

    // Print the incoming message
    console.log(text);

    // Redraw the prompt and whatever the user has typed so far
    const currentInput = rl.line || '';
    process.stdout.write(`${theme.dim('> ')}${theme.text(currentInput)}`);
};

export const enterChatroom = async () => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    let messageCursor = null;
    let totalFetched = 0;
    let lastMessageId = null;
    let isOnline = true;

    const spinner = ora(theme.text('Entering chatroom...')).start();

    try {
        const initialSnapshot = await withTimeout(fetchInitialMessages(10), SEND_TIMEOUT_MS);
        messageCursor = initialSnapshot.docs[initialSnapshot.docs.length - 1];
        totalFetched += initialSnapshot.docs.length;
        const history = initialSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

        spinner.stop();
        console.log(theme.success('Welcome to the Chatroom!'));
        console.log(theme.dim('--- Last 10 messages ---'));
        history.forEach((msg) => {
            console.log(formatMessage(msg));
        });
        if (history.length > 0) {
            lastMessageId = history[history.length - 1].id;
        }
        console.log(theme.dim("--- You are now in the chat (type 'p' for previous, ':q' to leave) ---"));
    } catch (error) {
        spinner.fail(theme.error('Failed to enter chatroom: ' + error.message));
        rl.close();
        return;
    }

    // ─── Connection State Monitoring ────────────────────────────
    const unsubConnection = subscribeToConnectionState((online) => {
        isOnline = online;
        if (online) {
            safePrint(rl, theme.success('● Back online'));
        } else {
            safePrint(rl, theme.error('● Connection lost — messages may not send'));
        }
    });

    // ─── Real-time Message Listener (with safe print) ───────────
    const unsubscribe = subscribeToMessages((snapshot) => {
        const latestMessageDoc = snapshot.docs[0];
        if (latestMessageDoc && latestMessageDoc.id !== lastMessageId) {
            if (latestMessageDoc.data().authorId !== getCurrentUserId()) {
                safePrint(rl, formatMessage(latestMessageDoc.data()));
            }
            lastMessageId = latestMessageDoc.id;
        }
    });

    const chat = () => {
        rl.question(theme.dim('> '), async (line) => {
            const input = line.trim().toLowerCase();

            if (input === ':q') {
                unsubscribe();
                unsubConnection();
                rl.close();
                return;
            }

            if (input === 'p') {
                if (!messageCursor) {
                    safePrint(rl, theme.secondary('No more messages to load.'));
                    return chat();
                }
                if (totalFetched >= 5000) {
                    safePrint(rl, theme.secondary('Reached the limit of 5000 messages.'));
                    return chat();
                }

                const prevSpinner = ora(theme.text('Loading previous messages...')).start();
                try {
                    const historySnapshot = await withTimeout(
                        fetchPreviousMessages(messageCursor, 10),
                        SEND_TIMEOUT_MS,
                    );
                    prevSpinner.stop();

                    if (historySnapshot.empty) {
                        console.log(theme.secondary('No more messages to load.'));
                        messageCursor = null;
                    } else {
                        messageCursor = historySnapshot.docs[historySnapshot.docs.length - 1];
                        totalFetched += historySnapshot.docs.length;
                        const olderHistory = historySnapshot.docs.map((doc) => doc.data()).reverse();
                        console.log(theme.dim('--- Loaded previous messages ---'));
                        olderHistory.forEach((msg) => console.log(formatMessage(msg)));
                    }
                } catch (error) {
                    prevSpinner.fail(theme.error('Failed to load previous messages: ' + error.message));
                }
                return chat();
            }

            if (line.trim() !== '') {
                if (!isOnline) {
                    safePrint(rl, theme.error('⚠ You are offline. Message not sent.'));
                    return chat();
                }
                try {
                    const newMessage = await withTimeout(submitMessage(line.trim()), SEND_TIMEOUT_MS);
                    console.log(formatMessage({ ...newMessage, createdAt: { seconds: Date.now() / 1000 } }));
                } catch (err) {
                    console.log(theme.error('⚠ ' + err.message));
                }
            }
            chat();
        });
    };
    chat();

    return new Promise((resolve) => {
        rl.on('SIGINT', () => {
            console.log(theme.secondary('\nForce quitting chatroom...'));
            unsubscribe();
            unsubConnection();
            rl.close();
        });
        rl.on('close', () => {
            console.log(theme.secondary('Leaving chatroom...'));
            resolve();
        });
    });
};
