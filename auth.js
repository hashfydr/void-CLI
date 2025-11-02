import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendEmailVerification, signOut } from 'firebase/auth';
import { auth, db } from './firebase.js';
import { doc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';
import chalk from 'chalk';
import inquirer from 'inquirer';

export const isUsernameUnique = async (username) => {
    const q = query(collection(db, 'users'), where('username', '==', username));
    const querySnapshot = await getDocs(q);
    return querySnapshot.empty;
};

export const login = async (loginIdentifier, password) => {
    try {
        let email = loginIdentifier;
        // Simple check to see if it's not an email
        if (!loginIdentifier.includes('@')) {
            const q = query(collection(db, 'users'), where('username', '==', loginIdentifier));
            const querySnapshot = await getDocs(q);
            if (querySnapshot.empty) {
                console.log(chalk.red('Login failed: User not found.'));
                return;
            }
            email = querySnapshot.docs[0].data().email;
        }

        await signInWithEmailAndPassword(auth, email, password);

        if (!auth.currentUser.emailVerified) {
            console.log(chalk.red('Login failed: Please verify your email address.'));
            const { resend } = await inquirer.prompt([
                {
                    type: 'confirm',
                    name: 'resend',
                    message: 'Do you want to resend the verification email?',
                    default: false,
                },
            ]);
            if (resend) {
                await sendEmailVerification(auth.currentUser);
                console.log(chalk.green('Verification email sent! Please check your inbox.'));
            }
            await signOut(auth);
            return;
        }

        console.log(chalk.green('Login successful!'));
    } catch (error) {
        console.log(chalk.red('Login failed:', error.message));
    }
};

export const signup = async (email, password, username) => {
    if (!email.endsWith('@thapar.edu')) {
        console.log(chalk.red('Signup failed: Only @thapar.edu emails are allowed.'));
        return;
    }

    try {
        const isUnique = await isUsernameUnique(username);
        if (!isUnique) {
            console.log(chalk.red('Username is already taken.'));
            return;
        }

        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        await sendEmailVerification(user);

        await setDoc(doc(db, 'users', user.uid), {
            email: user.email,
            uid: user.uid,
            username: username,
        });
        console.log(chalk.green('Signup successful! Please check your email to verify your account (Tip: Check your spam folder!).'));
    } catch (error) {
        console.log(chalk.red('Signup failed:', error.message));
    }
};