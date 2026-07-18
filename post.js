import { theme } from './utils/theme.js';
import ora from 'ora';
import { submitPost } from './services/postService.js';

export const createPost = async (content) => {
    const spinner = ora(theme.text('Creating post...')).start();
    try {
        await submitPost(content);
        spinner.succeed(theme.success('Post created successfully!'));
    } catch (error) {
        spinner.fail(theme.error('Failed to create post: ' + error.message));
    }
};
