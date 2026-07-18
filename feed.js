import chalk from 'chalk';
import ora from 'ora';
import { fetchPosts } from './services/feedService.js';
import { fetchComments } from './services/commentService.js';

export const getPosts = fetchPosts;

export const getFeed = async () => {
    const spinner = ora('Fetching feed...').start();
    try {
        const posts = await fetchPosts();

        if (posts.length === 0) {
            spinner.info(chalk.yellow('No posts in the feed yet.'));
            return;
        }

        spinner.succeed('Feed loaded.');

        for (const post of posts) {
            const username = post.username || 'Anonymous';
            const time = post.createdAt ? new Date(post.createdAt.seconds * 1000).toLocaleString() : 'No timestamp';

            console.log(`${chalk.yellow(username)} - ${chalk.cyan(time)}\n${chalk.white(post.content)}\n`);

            const comments = await fetchComments(post.id);
            if (comments.length > 0) {
                console.log(chalk.gray('  Comments:'));
                comments.forEach((comment) => {
                    console.log(`    ${chalk.blue(comment.authorUsername || 'Anonymous')}: ${comment.text}`);
                });
                console.log('');
            }
        }
    } catch (error) {
        spinner.fail(chalk.red('Failed to fetch feed: ' + error.message));
    }
};
