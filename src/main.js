import { findScript, insertScriptElement, processOptions } from './utils';
import { SDK_BASE_URL } from './constants';

let loadingPromise;

export function loadScript(options = {}) {

    if (loadingPromise) return loadingPromise;

    return loadingPromise = new Promise((resolve, reject) => {

        // resolve with null when running in Node
        if (!window) return resolve(null);

        const { attributes, queryString } = processOptions(options);
        const url = `${SDK_BASE_URL}?${queryString}`;

        // resolve with the existing global paypal object when it already exists
        if (findScript(url) && window.paypal) return resolve(window.paypal);

        insertScriptElement({
            url,
            attributes,
            callback:() => {
                if (window.paypal) return resolve(window.paypal);
                return reject(new Error('The window.paypal global variable is not available.'));
            }
        });
    });
}

// replaced with the package.json version at build time
export const version = '__VERSION__';
