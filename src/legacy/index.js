import Promise from 'promise-polyfill';
import loadScriptPromise from '../loadScript';

export function loadScript(options) {
    return loadScriptPromise(options, Promise);
}

// replaced with the package.json version at build time
export const version = '__VERSION__';
