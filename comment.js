import chalk from 'chalk';
import readline from 'readline';
import ora from 'ora';
import { submitComment, fetchComments, subscribeToComments } from './services/commentService.js';

const SEND_TIMEOUT_MS = 5000;

const formatComment = (comment) => {
    const username = comment.authorUsername || 'Anonymous';
    const time = comment.createdAt ? new Date(comment.createdAt.seconds * 1000).toLocaleString() : '';
    return `${chalk.cyan(time)} - ${chalk.yellow(username)}: ${comment.text}`;
};

/**
 * Wraps a promise with a timeout.
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
 * Safely prints output without corrupting the user's active input line.
 */
const safePrint = (rl, text) => {
    readline.cursorTo(process.stdout, 0);
    readline.clearLine(process.stdout, 0);
    console.log(text);
    const currentInput = rl.line || '';
    process.stdout.write(`${chalk.gray('> ')}${currentInput}`);
};

export const getComments = fetchComments;

export const createComment = async (postId, text) => {
    try {
        await withTimeout(submitComment(postId, text), SEND_TIMEOUT_MS);
    } catch (error) {
        console.log(chalk.red('⚠ ' + error.message));
    }
};

export const enterCommentSession = async (postId) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

    const displayComments = async () => {
        const spinner = ora('Loading comments...').start();
        try {
            let comments = await withTimeout(fetchComments(postId), SEND_TIMEOUT_MS);
            comments.sort((a, b) => {
                const timeA = a.createdAt ? a.createdAt.seconds : 0;
                const timeB = b.createdAt ? b.createdAt.seconds : 0;
                return timeB - timeA;
            });

            const commentsToDisplay = comments.slice(0, 10).reverse();

            spinner.stop();
            process.stdout.write('\x1Bc'); // Clear screen
            console.log(chalk.green(`Entering comment session for post ${postId}...`));
            console.log(chalk.gray("--- You are now in the comment chat (type ':q' to leave) ---"));
            commentsToDisplay.forEach((msg) => {
                console.log(formatComment(msg));
            });
        } catch (error) {
            spinner.fail(chalk.red('Failed to load comments: ' + error.message));
        }
    };

    await displayComments();

    const unsubscribe = subscribeToComments(postId, (snapshot) => {
        if (
            !snapshot.empty &&
            snapshot
                .docChanges()
                .some((change) => change.type === 'added' || change.type === 'modified' || change.type === 'removed')
        ) {
            displayComments();
        }
    });

    const chat = () => {
        rl.question(chalk.gray('> '), async (line) => {
            const input = line.trim().toLowerCase();

            if (input === ':q') {
                unsubscribe();
                rl.close();
                return;
            }

            if (line.trim() !== '') {
                await createComment(postId, line.trim());
            }
            chat();
        });
    };
    chat();

    return new Promise((resolve) => {
        rl.on('SIGINT', () => {
            console.log(chalk.yellow('\nForce quitting comment session...'));
            unsubscribe();
            rl.close();
        });
        rl.on('close', () => {
            console.log(chalk.yellow('Leaving comment session...'));
            unsubscribe();
            resolve();
        });
    });
};
