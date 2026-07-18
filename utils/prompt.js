import inquirer from 'inquirer';
import { theme } from './theme.js';

export const prompt = async (questions) => {
    const themedQuestions = questions.map((q) => {
        const themedQ = { ...q };
        if (themedQ.message) {
            themedQ.message = theme.secondary(themedQ.message);
        }
        themedQ.prefix = theme.primary('?');
        if (themedQ.choices) {
            themedQ.choices = themedQ.choices.map((c) => {
                if (typeof c === 'string') {
                    return { name: theme.text(c), value: c };
                } else if (c.name) {
                    return { ...c, name: theme.text(c.name) };
                }
                return c;
            });
        }
        return themedQ;
    });
    return inquirer.prompt(themedQuestions);
};
