import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import os from 'os';

const THEMES = {
    matrix: {
        bg: '#050505',
        primary: '#00FF41',
        secondary: '#008F11',
        success: '#00FF41',
        error: '#ff0000',
        text: '#00FF41',
        dim: '#003B00',
    },
    cobalt2: {
        bg: '#132738',
        primary: '#f0cc09',
        secondary: '#0088ff',
        success: '#38de21',
        error: '#ff0000',
        text: '#9effff',
        dim: '#ffc600',
    },
    'night-owl': {
        bg: '#011627',
        primary: '#c792ea',
        secondary: '#82aaff',
        success: '#22da6e',
        error: '#ef5350',
        text: '#7fdbca',
        dim: '#637777',
    },
    'ayu-dark': {
        bg: '#0f1419',
        primary: '#36a3d9', // Make logo blue instead of yellow
        secondary: '#ffcc66', // Make secondary yellow
        success: '#b8cc52',
        error: '#ff3333',
        text: '#ff9940',
        dim: '#5c6773',
    },
    'material-palenight': {
        bg: '#292d3e',
        primary: '#c792ea', // Make logo purple instead of yellow
        secondary: '#82aaff',
        success: '#c3e88d',
        error: '#ff5370',
        text: '#ffcb6b', // Make text yellow
        dim: '#676e95',
    },
    gruvbox: {
        bg: '#282828',
        primary: '#b8bb26',
        secondary: '#8ec07c',
        success: '#98971a',
        error: '#fb4934',
        text: '#ebdbb2',
        dim: '#a89984',
    },
    'rose-pine': {
        bg: '#191724',
        primary: '#ebbcba',
        secondary: '#c4a7e7',
        success: '#9ccfd8',
        error: '#eb6f92',
        text: '#e0def4',
        dim: '#6e6a86',
    },
    dracula: {
        bg: '#282a36',
        primary: '#ff79c6',
        secondary: '#bd93f9',
        success: '#50fa7b',
        error: '#ff5555',
        text: '#8be9fd',
        dim: '#6272a4',
    },
    synthwave84: {
        bg: '#262335',
        primary: '#36f9f6',
        secondary: '#b084eb',
        success: '#72f1b8',
        error: '#fe4450',
        text: '#fede5d',
        dim: '#8b7d9b',
    },
    'catppuccin-mocha': {
        bg: '#1e1e2e',
        primary: '#89b4fa',
        secondary: '#cba6f7',
        success: '#a6e3a1',
        error: '#f38ba8',
        text: '#f5c2e7',
        dim: '#585b70',
    },
    'monokai-pro': {
        bg: '#2d2a2e',
        primary: '#a9dc76',
        secondary: '#fc9867',
        success: '#a9dc76',
        error: '#ff6188',
        text: '#fcfcfa',
        dim: '#727072',
    },
    cyberpunk: {
        bg: '#000b1e',
        primary: '#0abdc6',
        secondary: '#ea00d9',
        success: '#711c91',
        error: '#ff003c',
        text: '#f3e600',
        dim: '#133e7c',
    },
};

const THEME_FILE = path.join(os.homedir(), '.void-cli-theme.json');

let currentThemeName = 'synthwave84';

// Load theme from file
if (fs.existsSync(THEME_FILE)) {
    try {
        const data = fs.readFileSync(THEME_FILE, 'utf-8');
        const parsed = JSON.parse(data);
        if (parsed.theme && THEMES[parsed.theme]) {
            currentThemeName = parsed.theme;
        }
    } catch (e) {
        // Ignored
    }
}

export const getAvailableThemes = () => Object.keys(THEMES);

export const applyGlobalTheme = () => {
    const bgColor = THEMES[currentThemeName].bg;
    if (bgColor) {
        // OSC 11 to set background color
        process.stdout.write(`\x1b]11;${bgColor}\x07`);
    }
};

export const resetGlobalTheme = () => {
    // Reset background to default
    process.stdout.write('\x1b]111\x07');
};

export const setTheme = (themeName) => {
    if (THEMES[themeName]) {
        currentThemeName = themeName;
        fs.writeFileSync(THEME_FILE, JSON.stringify({ theme: themeName }));
        applyGlobalTheme();
    }
};

export const theme = {
    get primary() { return chalk.hex(THEMES[currentThemeName].primary); },
    get secondary() { return chalk.hex(THEMES[currentThemeName].secondary); },
    get success() { return chalk.hex(THEMES[currentThemeName].success); },
    get error() { return chalk.hex(THEMES[currentThemeName].error); },
    get text() { return chalk.hex(THEMES[currentThemeName].text); },
    get dim() { return chalk.hex(THEMES[currentThemeName].dim); },
    get current() { return currentThemeName; }
};
