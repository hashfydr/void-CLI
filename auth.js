import { loginUser, signupUser, isUsernameUnique, resendVerification, logoutUser } from './services/authService.js';
import { auth } from './firebase.js';
import chalk from 'chalk';
import inquirer from 'inquirer';
import ora from 'ora';

export { isUsernameUnique };

export const getAutoLoginState = () => {
    return new Promise((resolve) => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            unsubscribe();
            resolve(user);
        });
    });
};

export const login = async (loginIdentifier, password, silent = false) => {
    const spinner = silent ? null : ora('Logging in...').start();
    try {
        await loginUser(loginIdentifier, password);
        if (spinner) spinner.succeed(chalk.green('Login successful!'));
        return true;
    } catch (error) {
        if (spinner) spinner.fail(chalk.red('Login failed: ' + error.message));
        if (error.code === 'auth/email-unverified' && !silent) {
            const { resend } = await inquirer.prompt([
                {
                    type: 'confirm',
                    name: 'resend',
                    message: 'Do you want to resend the verification email?',
                    default: false,
                },
            ]);
            if (resend) {
                const resendSpinner = ora('Sending verification email...').start();
                try {
                    await resendVerification(error.user);
                    resendSpinner.succeed(chalk.green('Verification email sent! Please check your inbox.'));
                } catch (resendError) {
                    resendSpinner.fail(chalk.red('Failed to send verification email: ' + resendError.message));
                }
            }
            await logoutUser();
        }
        return false;
    }
};

export const signup = async (email, password, username) => {
    const spinner = ora('Creating account...').start();
    try {
        await signupUser(email, password, username);
        spinner.succeed(
            chalk.green(
                'Signup successful! Please check your email to verify your account (Tip: Check your spam folder!).',
            ),
        );
    } catch (error) {
        spinner.fail(chalk.red('Signup failed: ' + error.message));
    }
};

export const logout = async () => {
    const spinner = ora('Logging out...').start();
    try {
        await logoutUser();
        spinner.succeed(chalk.green('Logged out successfully!'));
    } catch (error) {
        spinner.fail(chalk.red('Logout failed: ' + error.message));
    }
};
