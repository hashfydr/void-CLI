import { collection, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { db, auth } from './firebase.js';
import chalk from 'chalk';

export const createPost = async (content) => {
    try {
        const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
        const username = userDoc.data()?.username || auth.currentUser.email;

        await addDoc(collection(db, 'posts'), {
            content: content,
            createdAt: serverTimestamp(),
            author: auth.currentUser.uid,
            username: username,
        });
        console.log(chalk.green('Post created successfully!'));
    } catch (error) {
        console.log(chalk.red('Failed to create post:', error.message));
    }
};