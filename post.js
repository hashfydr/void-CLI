import chalk from 'chalk';
import ora from 'ora';
import { submitPost } from './services/postService.js';

export const createPost = async (content) => {
    const spinner = ora('Creating post...').start();
    try {
        await submitPost(content);
        spinner.succeed(chalk.green('Post created successfully!'));
    } catch (error) {
        spinner.fail(chalk.red('Failed to create post: ' + error.message));
    }
};
