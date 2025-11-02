import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, getDocs, limit, doc, getDoc, startAfter } from 'firebase/firestore';
import { db, auth } from './firebase.js';
import chalk from 'chalk';
import readline from 'readline';

const formatMessage = (message) => {
    const username = message.authorUsername || 'Anonymous';
    const time = message.createdAt ? new Date(message.createdAt.seconds * 1000).toLocaleString() : '';
    return `${chalk.cyan(time)} - ${chalk.yellow(username)}: ${message.text}`;
};

export const enterChatroom = async () => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    let messageCursor = null;
    let totalFetched = 0;
    let lastMessageId = null;

    console.log(chalk.green('Entering chatroom...'));

    // 1. Load initial history
    const initialQuery = query(collection(db, 'messages'), orderBy('createdAt', 'desc'), limit(10));
    const initialSnapshot = await getDocs(initialQuery);
    messageCursor = initialSnapshot.docs[initialSnapshot.docs.length - 1];
    totalFetched += initialSnapshot.docs.length;
    const history = initialSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    console.log(chalk.gray('--- Last 10 messages ---'));
    history.forEach(msg => {
        console.log(formatMessage(msg));
    });
    if (history.length > 0) {
        lastMessageId = history[history.length - 1].id;
    }
    console.log(chalk.gray("--- You are now in the chat (type 'p' for previous, ':q' to leave) ---"));

    // 2. Listen for new messages
    const liveQuery = query(collection(db, 'messages'), orderBy('createdAt', 'desc'), limit(1));
    const unsubscribe = onSnapshot(liveQuery, (snapshot) => {
        const latestMessageDoc = snapshot.docs[0];
        if (latestMessageDoc && latestMessageDoc.id !== lastMessageId) {
            // Only print messages from other users
            if (latestMessageDoc.data().authorId !== auth.currentUser.uid) {
                console.log(formatMessage(latestMessageDoc.data()));
            }
            lastMessageId = latestMessageDoc.id;
        }
    });

    // 3. Handle user input
    const chat = () => {
        rl.question('', async (line) => {
            const input = line.trim().toLowerCase();

            if (input === ':q') {
                unsubscribe();
                rl.close();
                return;
            }

            if (input === 'p') {
                if (!messageCursor) {
                    console.log(chalk.yellow('No more messages to load.'));
                    return chat();
                }
                if (totalFetched >= 5000) {
                    console.log(chalk.yellow('Reached the limit of 5000 messages.'));
                    return chat();
                }

                console.log(chalk.gray('--- Loading previous messages... ---'));
                const historyQuery = query(collection(db, 'messages'), orderBy('createdAt', 'desc'), startAfter(messageCursor), limit(10));
                const historySnapshot = await getDocs(historyQuery);
                
                if (historySnapshot.empty) {
                    console.log(chalk.yellow('No more messages to load.'));
                    messageCursor = null;
                } else {
                    messageCursor = historySnapshot.docs[historySnapshot.docs.length - 1];
                    totalFetched += historySnapshot.docs.length;
                    const olderHistory = historySnapshot.docs.map(doc => doc.data()).reverse();
                    olderHistory.forEach(msg => console.log(formatMessage(msg)));
                }
                return chat();
            }

            if (line.trim() !== '') {
                const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
                const username = userDoc.data()?.username || auth.currentUser.email;

                const newMessage = {
                    text: line,
                    createdAt: serverTimestamp(),
                    authorId: auth.currentUser.uid,
                    authorUsername: username,
                };
                await addDoc(collection(db, 'messages'), newMessage);

                // Local echo
                console.log(formatMessage({ ...newMessage, createdAt: { seconds: Date.now() / 1000 } }));
            }
            chat();
        });
    };
    chat();

    return new Promise((resolve) => {
        rl.on('close', () => {
            console.log(chalk.yellow('Leaving chatroom...'));
            resolve();
        });
    });
};