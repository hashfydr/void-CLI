// Import Firebase SDK
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA3ECwG19ahL9lPI949ah8kdy02tEG8hWg",
  authDomain: "void-c782c.firebaseapp.com",
  projectId: "void-c782c",
  storageBucket: "void-c782c.firebasestorage.app",
  messagingSenderId: "1012848373015",
  appId: "1:1012848373015:web:e591b008b28d0845709b52",
  measurementId: "G-WGXW5C3CLZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
