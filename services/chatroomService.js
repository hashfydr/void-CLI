import {
    collection,
    query,
    orderBy,
    onSnapshot,
    addDoc,
    serverTimestamp,
    getDocs,
    limit,
    doc,
    getDoc,
    startAfter,
} from 'firebase/firestore';
import { ref, onValue } from 'firebase/database';
import { db, auth, rtdb } from '../firebase.js';

export const fetchInitialMessages = async (limitCount = 10) => {
    const initialQuery = query(collection(db, 'messages'), orderBy('createdAt', 'desc'), limit(limitCount));
    const initialSnapshot = await getDocs(initialQuery);
    return initialSnapshot;
};

export const fetchPreviousMessages = async (messageCursor, limitCount = 10) => {
    const historyQuery = query(
        collection(db, 'messages'),
        orderBy('createdAt', 'desc'),
        startAfter(messageCursor),
        limit(limitCount),
    );
    const historySnapshot = await getDocs(historyQuery);
    return historySnapshot;
};

export const submitMessage = async (text) => {
    const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
    const username = userDoc.data()?.username || auth.currentUser.email;

    const newMessage = {
        text: text,
        createdAt: serverTimestamp(),
        authorId: auth.currentUser.uid,
        authorUsername: username,
    };
    await addDoc(collection(db, 'messages'), newMessage);
    return newMessage;
};

export const subscribeToMessages = (callback) => {
    const liveQuery = query(collection(db, 'messages'), orderBy('createdAt', 'desc'), limit(1));
    return onSnapshot(liveQuery, callback);
};

export const deleteMessage = async (messageId) => {
    const { deleteDoc } = await import('firebase/firestore');
    await deleteDoc(doc(db, 'messages', messageId));
};

export const getCurrentUserId = () => {
    return auth.currentUser?.uid;
};

/**
 * Subscribes to Firebase Realtime Database's special `.info/connected`
 * path. The callback fires with `true` when online and `false` when
 * the connection drops.
 *
 * NOTE: This requires Firebase Realtime Database to be enabled in your
 * Firebase project (even if you only use Firestore for app data).
 * The `.info/connected` path is free and built-in.
 */
export const subscribeToConnectionState = (callback) => {
    try {
        const connectedRef = ref(rtdb, '.info/connected');
        const unsub = onValue(connectedRef, (snapshot) => {
            callback(snapshot.val() === true);
        });
        return unsub;
    } catch {
        // If Realtime Database is not configured, fall back to a no-op.
        // The app will still work; it just won't show online/offline indicators.
        return () => {};
    }
};
