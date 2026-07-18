// Import Firebase SDK
import { initializeApp } from 'firebase/app';
import { initializeAuth, browserLocalPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your Firebase configuration
// These are public client keys. Security is enforced via Firestore Rules.
const firebaseConfig = {
    apiKey: "AIzaSyA3ECwG19ahL9lPI949ah8kdy02tEG8hWg",
    authDomain: "void-c782c.firebaseapp.com",
    databaseURL: "https://void-c782c-default-rtdb.firebaseio.com",
    projectId: "void-c782c",
    storageBucket: "void-c782c.firebasestorage.app",
    messagingSenderId: "1012848373015",
    appId: "1:1012848373015:web:e591b008b28d0845709b52",
    measurementId: "G-WGXW5C3CLZ",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

import { LocalStorage } from 'node-localstorage';
import os from 'os';
import path from 'path';

// Polyfill localStorage for Firebase Auth Persistence in Node.js
if (typeof global.localStorage === 'undefined' || global.localStorage === null) {
    global.localStorage = new LocalStorage(path.join(os.homedir(), '.void-cli-auth'));
}

// Initialize services
export const auth = initializeAuth(app, {
    persistence: browserLocalPersistence
});
export const db = getFirestore(app);

export default app;
