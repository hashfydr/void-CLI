import './polyfill.js';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from './firebase.js';

signInWithEmailAndPassword(auth, 'hgarg1_be24@thapar.edu', 'testpassword').then((userCredential) => {
    console.log("Logged in:", userCredential.user.uid);
    setTimeout(() => {
        console.log("Done.");
        process.exit(0);
    }, 1000);
}).catch((error) => {
    console.error("Error:", error);
});
