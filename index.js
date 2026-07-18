#!/usr/bin/env node

import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import { login, signup, isUsernameUnique, logout, getAutoLoginState } from './auth.js';
import { getFeed, getPosts } from './feed.js';
import { createPost } from './post.js';
import { enterCommentSession } from './comment.js';
import { enterChatroom } from './chatroom.js';
import { auth } from './firebase.js';

const displayAsciiArt = () => {
    console.log(
        chalk.green(`
    ██╗   ██╗ ██████╗ ██╗██████╗ 
    ██║   ██║██╔═══██╗██║██╔══██╗
    ██║   ██║██║   ██║██║██║  ██║
    ╚██╗ ██╔╝██║   ██║██║██║  ██║
     ╚████╔╝ ╚██████╔╝██║██████╔╝
      ╚═══╝   ╚═════╝ ╚═╝╚═════╝ 
    `),
    );
};

const loggedInMenu = async () => {
    const choices = ['View Feed', 'Create Post', 'Delete Post', 'View/Discuss Post Comments', 'Chatroom', 'Logout', 'Exit'];

    while (true) {
        const { choice } = await inquirer.prompt([
            {
                type: 'input',
                name: 'choice',
                message: `What do you want to do?\n${choices.map((c, i) => `  ${i + 1}. ${c}`).join('\n')}\n> `,
            },
        ]);

        const selectedChoice = choices[parseInt(choice, 10) - 1] || '';

        switch (selectedChoice) {
            case 'View Feed': {
                await getFeed();
                break;
            }

            case 'Create Post': {
                const { content } = await inquirer.prompt([
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
                const postsSpinner = ora('Fetching posts...').start();
                const posts = await getPosts();
                
                // Filter posts that the user is allowed to delete
                const isModerator = auth.currentUser?.email === 'adonisbeing@gmail.com';
                const deletablePosts = posts.filter(p => isModerator || p.author === auth.currentUser.uid);
                
                if (deletablePosts.length === 0) {
                    postsSpinner.info(chalk.yellow('You do not have any posts to delete.'));
                    break;
                }
                postsSpinner.stop();
                
                const deleteChoices = deletablePosts.map((post, i) => ({
                    name: `${i + 1}. [${post.username}] ${post.content.substring(0, 50)}...`,
                    value: post.id,
                }));
                deleteChoices.push({ name: 'Cancel', value: 'cancel' });
                
                const { postId } = await inquirer.prompt([
                    {
                        type: 'list',
                        name: 'postId',
                        message: 'Which post do you want to delete?',
                        choices: deleteChoices,
                    },
                ]);
                
                if (postId !== 'cancel') {
                    const delSpinner = ora('Deleting post...').start();
                    try {
                        const { deletePost } = await import('./services/postService.js');
                        await deletePost(postId);
                        delSpinner.succeed(chalk.green('Post deleted successfully.'));
                    } catch (err) {
                        delSpinner.fail(chalk.red('Failed to delete post: ' + err.message));
                    }
                }
                break;
            }

            case 'View/Discuss Post Comments': {
                const postsSpinner = ora('Fetching posts...').start();
                const posts = await getPosts();
                if (posts.length === 0) {
                    postsSpinner.info(chalk.yellow('There are no posts to discuss.'));
                    break;
                }
                postsSpinner.stop();
                const postChoices = posts.map((post, i) => ({
                    name: `${i + 1}. ${post.content.substring(0, 80)}...`,
                    value: post.id,
                }));
                const { postId } = await inquirer.prompt([
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

            case 'Logout': {
                await logout();
                return; // Return to trigger startMenu again
            }

            case 'Exit': {
                console.log(chalk.blue('Goodbye!'));
                process.exit(0);
                break;
            }

            default: {
                console.log(chalk.red('Invalid choice. Please try again.'));
                break;
            }
        }
    }
};

const startMenu = async () => {
    const choices = ['Login', 'Signup', 'Exit'];

    while (true) {
        const { choice } = await inquirer.prompt([
            {
                type: 'input',
                name: 'choice',
                message: `Welcome to Void!\n${choices.map((c, i) => `  ${i + 1}. ${c}`).join('\n')}\n> `,
            },
        ]);

        const selectedChoice = choices[parseInt(choice, 10) - 1] || '';

        switch (selectedChoice) {
            case 'Login': {
                const loginAnswers = await inquirer.prompt([
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
                const emailAnswer = await inquirer.prompt([
                    {
                        type: 'input',
                        name: 'email',
                        message: 'Email:',
                    },
                ]);

                let usernameAnswer;
                while (true) {
                    usernameAnswer = await inquirer.prompt([
                        {
                            type: 'input',
                            name: 'username',
                            message: 'Username:',
                        },
                    ]);
                    const usernameSpinner = ora('Checking username...').start();
                    const isUnique = await isUsernameUnique(usernameAnswer.username);
                    if (isUnique) {
                        usernameSpinner.stop();
                        break;
                    }
                    usernameSpinner.fail(chalk.red('Username is already taken. Please try another.'));
                }

                const passwordAnswer = await inquirer.prompt([
                    {
                        type: 'password',
                        name: 'password',
                        message: 'Password:',
                    },
                ]);

                await signup(emailAnswer.email, passwordAnswer.password, usernameAnswer.username);

                if (auth.currentUser && !auth.currentUser.emailVerified) {
                    console.log(chalk.yellow('A verification email has been sent. Please check your inbox.'));
                    while (true) {
                        const { action } = await inquirer.prompt([
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
                            console.log(chalk.green('\nEmail verified successfully! You are now logged in.'));
                            await loggedInMenu();
                            break;
                        } else {
                            console.log(chalk.red('Email not yet verified. Please check your inbox or spam folder.'));
                        }
                    }
                } else if (auth.currentUser && auth.currentUser.emailVerified) {
                    await loggedInMenu();
                }
                break;
            }

            case 'Exit': {
                console.log(chalk.blue('Goodbye!'));
                process.exit(0);
                break;
            }

            default: {
                console.log(chalk.red('Invalid choice. Please try again.'));
                break;
            }
        }
    }
};

const autoLogin = async () => {
    const user = await getAutoLoginState();
    if (user && user.emailVerified) {
        console.log(chalk.cyan(`Found saved session for ${user.email}. Logging in automatically...`));
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
            console.log(chalk.blue('\nGoodbye!'));
            process.exit(0);
        } else {
            throw error;
        }
    }
};

main();
