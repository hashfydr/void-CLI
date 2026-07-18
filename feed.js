import { theme } from './utils/theme.js';
import ora from 'ora';
import { fetchPosts } from './services/feedService.js';
import { fetchComments } from './services/commentService.js';

export const getPosts = fetchPosts;

export const getFeed = async () => {
    const spinner = ora(theme.text('Fetching feed...')).start();
    try {
        const posts = await fetchPosts();

        if (posts.length === 0) {
            spinner.info(theme.secondary('No posts in the feed yet.'));
            return;
        }

        // Fetch comments for all posts in parallel
        const postsWithComments = await Promise.all(
            posts.map(async (post) => {
                const comments = await fetchComments(post.id);
                return { ...post, comments };
            })
        );

        spinner.succeed('Feed loaded.');

        for (const post of postsWithComments) {
            const username = post.username || 'Anonymous';
            const time = post.createdAt ? new Date(post.createdAt.seconds * 1000).toLocaleString() : 'No timestamp';

            console.log(`${theme.secondary(username)} - ${theme.primary(time)}\n${theme.text(post.content)}\n`);

            if (post.comments.length > 0) {
                console.log(theme.dim('  Comments:'));
                post.comments.forEach((comment) => {
                    console.log(`    ${theme.primary(comment.authorUsername || 'Anonymous')}: ${theme.text(comment.text)}`);
                });
                console.log('');
            }
        }
    } catch (error) {
        spinner.fail(theme.error('Failed to fetch feed: ' + error.message));
    }
};
