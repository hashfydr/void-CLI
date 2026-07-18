#!/usr/bin/env node

import { prompt } from './utils/prompt.js';

import ora from 'ora';
import { theme, getAvailableThemes, setTheme, applyGlobalTheme, resetGlobalTheme } from './utils/theme.js';
import { login, signup, isUsernameUnique, logout, getAutoLoginState } from './auth.js';
import { getFeed, getPosts } from './feed.js';
import { createPost } from './post.js';
import { enterCommentSession } from './comment.js';
import { enterChatroom } from './chatroom.js';
import { auth } from './firebase.js';

const displayAsciiArt = () => {
    console.log(
        theme.primary(`
    ██╗   ██╗ ██████╗ ██╗██████╗ 
    ██║   ██║██╔═══██╗██║██╔══██╗
    ██║   ██║██║   ██║██║██║  ██║
    ╚██╗ ██╔╝██║   ██║██║██║  ██║
     ╚████╔╝ ╚██████╔╝██║██████╔╝
      ╚═══╝   ╚═════╝ ╚═╝╚═════╝ 
    `),
    );
};

// Register cleanup handlers to reset the terminal background when the CLI exits
process.on('exit', () => {
    resetGlobalTheme();
});
process.on('SIGINT', () => {
    resetGlobalTheme();
    process.exit(0);
});

// Apply the global background theme right away on startup
applyGlobalTheme();

const loggedInMenu = async () => {
    const choices = ['View Feed', 'Create Post', 'Delete Post', 'View/Discuss Post Comments', 'Chatroom', 'Theme Settings', 'Logout', 'Exit'];

    while (true) {
        const { choice } = await prompt([
            {
                type: 'list',
                name: 'choice',
                message: 'What do you want to do?',
                choices: choices,
            },
        ]);

        const selectedChoice = choice;

        switch (selectedChoice) {
            case 'View Feed': {
                await getFeed();
                break;
            }

            case 'Create Post': {
                const { content } = await prompt([
                    {
                        type: 'input',
                        name: 'content',
                        message: 'What do you want to post?',
                        validate: input => input.trim().length > 0 ? true : 'Post cannot be empty.'
                    },
                ]);
                await createPost(content);
                break;
            }

            case 'Delete Post': {
                const postsSpinner = ora(theme.text('Fetching posts...')).start();
                const posts = await getPosts();
                
                // Filter posts that the user is allowed to delete
                const isModerator = auth.currentUser?.email === 'adonisbeing@gmail.com';
                const deletablePosts = posts.filter(p => isModerator || p.author === auth.currentUser.uid);
                
                if (deletablePosts.length === 0) {
                    postsSpinner.info(theme.secondary('You do not have any posts to delete.'));
                    break;
                }
                postsSpinner.stop();
                
                const deleteChoices = deletablePosts.map((post, i) => ({
                    name: `${i + 1}. [${post.username}] ${post.content.substring(0, 50)}...`,
                    value: post.id,
                }));
                deleteChoices.push({ name: 'Cancel', value: 'cancel' });
                
                const { postId } = await prompt([
                    {
                        type: 'list',
                        name: 'postId',
                        message: 'Which post do you want to delete?',
                        choices: deleteChoices,
                    },
                ]);
                
                if (postId !== 'cancel') {
                    const delSpinner = ora(theme.text('Deleting post...')).start();
                    try {
                        const { deletePost } = await import('./services/postService.js');
                        await deletePost(postId);
                        delSpinner.succeed(theme.success('Post deleted successfully.'));
                    } catch (err) {
                        delSpinner.fail(theme.error('Failed to delete post: ' + err.message));
                    }
                }
                break;
            }

            case 'View/Discuss Post Comments': {
                const postsSpinner = ora(theme.text('Fetching posts...')).start();
                const posts = await getPosts();
                if (posts.length === 0) {
                    postsSpinner.info(theme.secondary('There are no posts to discuss.'));
                    break;
                }
                postsSpinner.stop();
                const postChoices = posts.map((post, i) => ({
                    name: `${i + 1}. ${post.content.substring(0, 80)}...`,
                    value: post.id,
                }));
                const { postId } = await prompt([
                    {
                        type: 'list',
                        name: 'postId',
                        message: 'Which post do you want to discuss?',
                        choices: postChoices,
                    },
                ]);
                await enterCommentSession(postId);
                break;
            }

            case 'Chatroom': {
                await enterChatroom();
                break;
            }

            case 'Theme Settings': {
                const availableThemes = getAvailableThemes();
                const themeChoices = availableThemes.map(t => ({
                    name: t === theme.current ? `${t} (Current)` : t,
                    value: t
                }));
                themeChoices.push({ name: 'Cancel', value: 'cancel' });
                
                const { selectedTheme } = await prompt([
                    {
                        type: 'list',
                        name: 'selectedTheme',
                        message: 'Select a theme for your terminal:',
                        choices: themeChoices,
                    },
                ]);
                
                if (selectedTheme !== 'cancel') {
                    setTheme(selectedTheme);
                    console.clear();
                    displayAsciiArt();
                    console.log(theme.success(`Theme updated to ${selectedTheme}!`));
                }
                break;
            }

            case 'Logout': {
                await logout();
                return; // Return to trigger startMenu again
            }

            case 'Exit': {
                console.log(theme.primary('Goodbye!'));
                process.exit(0);
                break;
            }

            default: {
                console.log(theme.error('Invalid choice. Please try again.'));
                break;
            }
        }
    }
};

const startMenu = async () => {
    const choices = ['Login', 'Signup', 'Exit'];

    while (true) {
        const { choice } = await prompt([
            {
                type: 'list',
                name: 'choice',
                message: 'Welcome to Void CLI!',
                choices: choices,
            },
        ]);

        const selectedChoice = choice;

        switch (selectedChoice) {
            case 'Login': {
                const loginAnswers = await prompt([
                    {
                        type: 'input',
                        name: 'loginIdentifier',
                        message: 'Email or Username:',
                    },
                    {
                        type: 'password',
                        name: 'password',
                        message: 'Password:',
                    },
                ]);
                await login(loginAnswers.loginIdentifier, loginAnswers.password);
                if (auth.currentUser) {
                    await loggedInMenu();
                }
                break;
            }

            case 'Signup': {
                const emailAnswer = await prompt([
                    {
                        type: 'input',
                        name: 'email',
                        message: 'Email:',
                    },
                ]);

                let usernameAnswer;
                while (true) {
                    usernameAnswer = await prompt([
                        {
                            type: 'input',
                            name: 'username',
                            message: 'Username:',
                        },
                    ]);
                    const usernameSpinner = ora(theme.text('Checking username...')).start();
                    const isUnique = await isUsernameUnique(usernameAnswer.username);
                    if (isUnique) {
                        usernameSpinner.stop();
                        break;
                    }
                    usernameSpinner.fail(theme.error('Username is already taken. Please try another.'));
                }

                const passwordAnswer = await prompt([
                    {
                        type: 'password',
                        name: 'password',
                        message: 'Password:',
                    },
                ]);

                await signup(emailAnswer.email, passwordAnswer.password, usernameAnswer.username);

                if (auth.currentUser && !auth.currentUser.emailVerified) {
                    console.log(theme.secondary('A verification email has been sent. Please check your inbox.'));
                    while (true) {
                        const { action } = await prompt([
                            {
                                type: 'input',
                                name: 'action',
                                message: "Press Enter to check your verification status, or type ':q' to quit:",
                            },
                        ]);

                        if (action.toLowerCase() === ':q') {
                            process.exit(0);
                        }

                        await auth.currentUser.reload();
                        if (auth.currentUser.emailVerified) {
                            console.log(theme.success('\nEmail verified successfully! You are now logged in.'));
                            await loggedInMenu();
                            break;
                        } else {
                            console.log(theme.error('Email not yet verified. Please check your inbox or spam folder.'));
                        }
                    }
                } else if (auth.currentUser && auth.currentUser.emailVerified) {
                    await loggedInMenu();
                }
                break;
            }

            case 'Exit': {
                console.log(theme.primary('Goodbye!'));
                process.exit(0);
                break;
            }

            default: {
                console.log(theme.error('Invalid choice. Please try again.'));
                break;
            }
        }
    }
};

const autoLogin = async () => {
    const user = await getAutoLoginState();
    if (user && user.emailVerified) {
        console.log(theme.primary(`Found saved session for ${user.email}. Logging in automatically...`));
        return true;
    }
    return false;
};

const main = async () => {
    try {
        displayAsciiArt();
        
        while (true) {
            const loggedIn = await autoLogin();
            if (loggedIn) {
                await loggedInMenu();
            } else {
                await startMenu();
            }
        }
    } catch (error) {
        if (error.name === 'ExitPromptError') {
            console.log(theme.primary('\nGoodbye!'));
            process.exit(0);
        } else {
            throw error;
        }
    }
};

main();
