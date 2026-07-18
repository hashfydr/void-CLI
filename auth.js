import { loginUser, signupUser, isUsernameUnique, resendVerification, logoutUser } from './services/authService.js';
import { auth } from './firebase.js';
import { theme } from './utils/theme.js';
import { prompt } from './utils/prompt.js';
import ora from 'ora';

export { isUsernameUnique };

import fs from 'fs';
import path from 'path';
import os from 'os';

const credentialsPath = path.join(os.homedir(), '.void-cli-credentials.json');

export const getAutoLoginState = async () => {
    try {
        if (fs.existsSync(credentialsPath)) {
            const data = fs.readFileSync(credentialsPath, 'utf8');
            const { identifier, password } = JSON.parse(data);
            const user = await loginUser(identifier, password);
            return user;
        }
    } catch (e) {
        // If anything fails, delete the corrupted/invalid credentials
        if (fs.existsSync(credentialsPath)) {
            fs.unlinkSync(credentialsPath);
        }
    }
    return null;
};

export const login = async (loginIdentifier, password, silent = false) => {
    const spinner = silent ? null : ora(theme.text('Logging in...')).start();
    try {
        await loginUser(loginIdentifier, password);
        // Save credentials securely with 0600 permissions (only owner can read/write)
        fs.writeFileSync(credentialsPath, JSON.stringify({ identifier: loginIdentifier, password }), { mode: 0o600 });
        if (spinner) spinner.succeed(theme.success('Login successful!'));
        return true;
    } catch (error) {
        if (spinner) spinner.fail(theme.error('Login failed: ' + error.message));
        if (error.code === 'auth/email-unverified' && !silent) {
            const { resend } = await prompt([
                {
                    type: 'confirm',
                    name: 'resend',
                    message: 'Do you want to resend the verification email?',
                    default: false,
                },
            ]);
            if (resend) {
                const resendSpinner = ora(theme.text('Sending verification email...')).start();
                try {
                    await resendVerification(error.user);
                    resendSpinner.succeed(theme.success('Verification email sent! Please check your inbox.'));
                } catch (resendError) {
                    resendSpinner.fail(theme.error('Failed to send verification email: ' + resendError.message));
                }
            }
            await logoutUser();
        }
        return false;
    }
};

export const signup = async (email, password, username) => {
    const spinner = ora(theme.text('Creating account...')).start();
    try {
        await signupUser(email, password, username);
        spinner.succeed(
            theme.success(
                'Signup successful! Please check your email to verify your account (Tip: Check your spam folder!).',
            ),
        );
    } catch (error) {
        spinner.fail(theme.error('Signup failed: ' + error.message));
    }
};

export const logout = async () => {
    const spinner = ora(theme.text('Logging out...')).start();
    try {
        await logoutUser();
        if (fs.existsSync(credentialsPath)) {
            fs.unlinkSync(credentialsPath);
        }
        spinner.succeed(theme.success('Logged out successfully!'));
    } catch (error) {
        spinner.fail(theme.error('Logout failed: ' + error.message));
    }
};
