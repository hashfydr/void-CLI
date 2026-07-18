import { collection, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../firebase.js';

export const submitPost = async (content) => {
    const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
    const username = userDoc.data()?.username || auth.currentUser.email;

    await addDoc(collection(db, 'posts'), {
        content: content,
        createdAt: serverTimestamp(),
        author: auth.currentUser.uid,
        username: username,
    });
};
