import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase.js';

export const fetchPosts = async () => {
    const postsCollection = collection(db, 'posts');
    const q = query(postsCollection, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};
