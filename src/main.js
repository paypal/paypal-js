import { findScript, insertScriptElement, objectToQueryString } from './utils';

const SDK_BASE_URL = 'https://www.paypal.com/sdk/js';
let loadingPromise;

export function loadScript({ params = {}, attributes = {}, properties = {} }) {

    if (loadingPromise) return loadingPromise;

    return loadingPromise = new Promise((resolve, reject) => {

        // resolve with null when running in Node
        if (!window) return resolve(null);

        const queryString = objectToQueryString(params);
        const url = `${SDK_BASE_URL}?${queryString}`;

        // resolve with the existing global paypal object when it already exists
        if (findScript(url) && window.paypal) return resolve(window.paypal);

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
