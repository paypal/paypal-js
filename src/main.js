import { insertScriptElement, processOptions } from './utils';

const SDK_BASE_URL = 'https://www.paypal.com/sdk/js';
let loadingPromise;

export function loadScript(options = {}) {

    if (loadingPromise) return loadingPromise;

    return loadingPromise = new Promise((resolve, reject) => {

        // resolve with null when running in Node
        if (!window) return resolve(null);

        // resolve with the existing global paypal object when it already exists
        if (window.paypal) return resolve(window.paypal);

        const { queryString, attributes, properties } = processOptions(options);
        const url = `${SDK_BASE_URL}?${queryString}`;

        insertScriptElement({
            url,
            attributes,
            properties,
            callback:() => {
                if (window.paypal) return resolve(window.paypal);
                return reject(new Error('The window.paypal global variable is not available.'));
            }
        });
    });
}

// replaced with the package.json version at build time
export const version = '__VERSION__';
