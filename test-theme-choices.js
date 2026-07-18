import inquirer from 'inquirer';
import chalk from 'chalk';

const run = async () => {
    const { res } = await inquirer.prompt([
        {
            type: 'list',
            name: 'res',
            message: chalk.cyan('What is your favorite color?'),
            prefix: chalk.magenta('?'),
            choices: [
                { name: chalk.green('Red'), value: 'Red' },
                { name: chalk.yellow('Blue'), value: 'Blue' },
            ],
        }
    ]);
    console.log(res);
}

run();
