import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    sendEmailVerification,
    signOut,
} from 'firebase/auth';
import { auth, db } from '../firebase.js';
import { doc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';

export const isUsernameUnique = async (username) => {
    const q = query(collection(db, 'users'), where('username', '==', username));
    const querySnapshot = await getDocs(q);
    return querySnapshot.empty;
};

export const loginUser = async (loginIdentifier, password) => {
    let email = loginIdentifier;
    if (!loginIdentifier.includes('@')) {
        const q = query(collection(db, 'users'), where('username', '==', loginIdentifier));
        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) {
            throw new Error('User not found.');
        }
        email = querySnapshot.docs[0].data().email;
    }

    const userCredential = await signInWithEmailAndPassword(auth, email, password);

    if (!userCredential.user.emailVerified) {
        const user = userCredential.user;
        const error = new Error('Please verify your email address.');
        error.code = 'auth/email-unverified';
        error.user = user;
        throw error;
    }

    return userCredential.user;
};

export const resendVerification = async (user) => {
    await sendEmailVerification(user);
};

export const signupUser = async (email, password, username) => {

    const isUnique = await isUsernameUnique(username);
    if (!isUnique) {
        throw new Error('Username is already taken.');
    }

    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await sendEmailVerification(user);

    await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        uid: user.uid,
        username: username,
    });

    return user;
};

export const logoutUser = async () => {
    await signOut(auth);
};
