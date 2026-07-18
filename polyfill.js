import { LocalStorage } from 'node-localstorage';
import os from 'os';
import path from 'path';

if (typeof global.localStorage === 'undefined' || global.localStorage === null) {
    global.localStorage = new LocalStorage(path.join(os.homedir(), '.void-cli-auth'));
}

if (typeof global.sessionStorage === 'undefined' || global.sessionStorage === null) {
    global.sessionStorage = new LocalStorage(path.join(os.homedir(), '.void-cli-session'));
}

if (typeof global.window === 'undefined') {
    global.window = {
        localStorage: global.localStorage,
        sessionStorage: global.sessionStorage,
        addEventListener: () => {},
        removeEventListener: () => {}
    };
}
if (typeof global.document === 'undefined') {
    global.document = {
        addEventListener: () => {},
        removeEventListener: () => {}
    };
}
