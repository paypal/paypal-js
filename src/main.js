import { insertScriptElement, processOptions } from './utils';

const SDK_BASE_URL = 'https://www.paypal.com/sdk/js';
let loadingPromise;
let isLoading = false;

export function loadScript(options) {
    // resolve with the existing promise when the script is loading
    if (isLoading) return loadingPromise;

    return loadingPromise = new Promise((resolve, reject) => {
        // resolve with null when running in Node
        if (typeof window === 'undefined') return resolve(null);

        // resolve with the existing global paypal object when it already exists
        // TODO: figure out how to support caching as well as reloading when script attributes change
        // if (window.paypal) return resolve(window.paypal);

        isLoading = true;

        const { queryString, dataAttributes, scriptAttributes } = processOptions(options);
        const url = `${SDK_BASE_URL}?${queryString}`;

        insertScriptElement({
            url,
            dataAttributes,
            scriptAttributes,
            callback: () => {
                isLoading = false;
                if (window.paypal) return resolve(window.paypal);
                return reject(new Error('The window.paypal global variable is not available.'));
            }
        });
    });
}

// replaced with the package.json version at build time
export const version = '__VERSION__';
