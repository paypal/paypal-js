import { objectToQueryParams, insertScriptElement } from './utils';

const SDK_BASE_URL = 'https://www.paypal.com/sdk/js';
let loadingPromise;

export default function getScript(params = {}) {

    if (loadingPromise) return loadingPromise;

    return loadingPromise = new Promise((resolve, reject) => {

        // resolve with null when running in Node
        if (!window) return resolve(null);

        const queryParameters = objectToQueryParams(params);

        insertScriptElement(`${SDK_BASE_URL}?${queryParameters}`, () => {
            if (window.paypal) return resolve(window.paypal);

            return reject(new Error('The window.paypal global variable is not available.'));
        });
    });
}

// replaced with the package.json version at build time
getScript.version = '__VERSION__';
