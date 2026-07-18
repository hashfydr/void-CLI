import {
    collection,
    addDoc,
    serverTimestamp,
    doc,
    getDoc,
    query,
    where,
    getDocs,
    onSnapshot,
} from 'firebase/firestore';
import { db, auth } from '../firebase.js';

export const submitComment = async (postId, text) => {
    const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
    const username = userDoc.data()?.username || auth.currentUser.email;

    await addDoc(collection(db, 'comments'), {
        postId: postId,
        text: text,
        authorId: auth.currentUser.uid,
        authorUsername: username,
        createdAt: serverTimestamp(),
    });
};

export const fetchComments = async (postId) => {
    const q = query(collection(db, 'comments'), where('postId', '==', postId));
    const querySnapshot = await getDocs(q);
    const comments = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return comments.sort((a, b) => {
        const timeA = a.createdAt ? a.createdAt.seconds : 0;
        const timeB = b.createdAt ? b.createdAt.seconds : 0;
        return timeA - timeB;
    });
};

export const subscribeToComments = (postId, callback) => {
    const liveQuery = query(collection(db, 'comments'), where('postId', '==', postId));
    return onSnapshot(liveQuery, callback);
};

export const deleteComment = async (commentId) => {
    const { deleteDoc } = await import('firebase/firestore');
    await deleteDoc(doc(db, 'comments', commentId));
};
