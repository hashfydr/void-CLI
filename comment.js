import { collection, addDoc, serverTimestamp, doc, getDoc, query, where, getDocs, onSnapshot, limit } from 'firebase/firestore';
import { db, auth } from './firebase.js';
import chalk from 'chalk';
import readline from 'readline';

const formatComment = (comment) => {
    const username = comment.authorUsername || 'Anonymous';
    const time = comment.createdAt ? new Date(comment.createdAt.seconds * 1000).toLocaleString() : '';
    return `${chalk.cyan(time)} - ${chalk.yellow(username)}: ${comment.text}`;
};

export const createComment = async (postId, text) => {
    try {
        const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
        const username = userDoc.data()?.username || auth.currentUser.email;

        await addDoc(collection(db, 'comments'), {
            postId: postId,
            text: text,
            authorId: auth.currentUser.uid,
            authorUsername: username,
            createdAt: serverTimestamp(),
        });
    } catch (error) {
        console.log(chalk.red('Failed to add comment:', error.message));
    }
};

export const getComments = async (postId) => {
    const q = query(collection(db, 'comments'), where('postId', '==', postId));
    const querySnapshot = await getDocs(q);
    const comments = querySnapshot.docs.map(doc => doc.data());
    // Client-side sort ascending for feed
    return comments.sort((a, b) => {
        const timeA = a.createdAt ? a.createdAt.seconds : 0;
        const timeB = b.createdAt ? b.createdAt.seconds : 0;
        return timeA - timeB;
    });
};

export const enterCommentSession = async (postId) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    let displayedComments = [];

    console.log(chalk.green(`Entering comment session for post ${postId}...`));

    const fetchAndDisplayComments = async () => {
        const q = query(collection(db, 'comments'), where('postId', '==', postId));
        const querySnapshot = await getDocs(q);
        let comments = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        // Client-side sort descending for chat
        comments.sort((a, b) => {
            const timeA = a.createdAt ? a.createdAt.seconds : 0;
            const timeB = b.createdAt ? b.createdAt.seconds : 0;
            return timeB - timeA;
        });
        
        // Display only the latest 10 comments for the chat-like view
        const commentsToDisplay = comments.slice(0, 10).reverse();

        // Clear console and re-render
        process.stdout.write('\x1Bc'); // Clear screen
        console.log(chalk.green(`Entering comment session for post ${postId}...`));
        console.log(chalk.gray("--- You are now in the comment chat (type ':q' to leave) ---"));
        commentsToDisplay.forEach(msg => {
            console.log(formatComment(msg));
        });
        console.log('\n> '); // Prompt for input

        displayedComments = commentsToDisplay.map(c => c.id);
    };

    // Initial fetch and display
    await fetchAndDisplayComments();

    // 2. Listen for new comments
    const liveQuery = query(collection(db, 'comments'), where('postId', '==', postId));
    const unsubscribe = onSnapshot(liveQuery, (snapshot) => {
        // Only re-render if there are actual changes
        if (!snapshot.empty && snapshot.docChanges().some(change => change.type === 'added' || change.type === 'modified' || change.type === 'removed')) {
            fetchAndDisplayComments();
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

            if (line.trim() !== '') {
                await createComment(postId, line.trim());
                // Local echo is handled by the re-render from onSnapshot
            }
            chat();
        });
    };
    chat();

    return new Promise((resolve) => {
        rl.on('close', () => {
            console.log(chalk.yellow('Leaving comment session...'));
            unsubscribe(); // Ensure unsubscribe on close
            resolve();
        });
    });
};
