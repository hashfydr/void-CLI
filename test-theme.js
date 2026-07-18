import inquirer from 'inquirer';
import chalk from 'chalk';

const myTheme = {
    prefix: chalk.magenta('?'),
    style: {
        message: chalk.cyan,
        answer: chalk.yellow,
        highlight: chalk.green,
    },
};

const run = async () => {
    const { res } = await inquirer.prompt([
        {
            type: 'list',
            name: 'res',
            message: 'What is your favorite color?',
            choices: ['Red', 'Blue', 'Green'],
            theme: myTheme,
        }
    ]);
    console.log(res);
}

run();
