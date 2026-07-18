import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase.js';

export const fetchPosts = async (limitCount = 15) => {
    const postsCollection = collection(db, 'posts');
    const q = query(postsCollection, orderBy('createdAt', 'desc'), limit(limitCount));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};
