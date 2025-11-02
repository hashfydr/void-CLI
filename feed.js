import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from './firebase.js';
import chalk from 'chalk';
import { getComments } from './comment.js';

export const getPosts = async () => {
    const postsCollection = collection(db, 'posts');
    const q = query(postsCollection, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getFeed = async () => {
    try {
        const posts = await getPosts();

        if (posts.length === 0) {
            console.log(chalk.yellow('No posts in the feed yet.'));
            return;
        }

        for (const post of posts) {
            const username = post.username || 'Anonymous';
            const time = post.createdAt ? new Date(post.createdAt.seconds * 1000).toLocaleString() : 'No timestamp';

            console.log(
                `${chalk.yellow(username)} - ${chalk.cyan(time)}\n${chalk.white(post.content)}\n`
            );

            const comments = await getComments(post.id);
            if (comments.length > 0) {
                console.log(chalk.gray('  Comments:'));
                comments.forEach(comment => {
                    console.log(`    ${chalk.blue(comment.authorUsername || 'Anonymous')}: ${comment.text}`);
                });
                console.log(''); // Add a blank line for spacing
            }
        }
    } catch (error) {
        console.log(chalk.red('Failed to fetch feed:', error.message));
    }
};