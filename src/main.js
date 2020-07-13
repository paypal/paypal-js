import { objectToQueryParams, insertScriptElement } from './utils';

const SDK_BASE_URL = 'https://www.paypal.com/sdk/js';
let loadingPromise;

export default function getScript(params = {}) {

    if (loadingPromise) return loadingPromise;

    return loadingPromise = new Promise((resolve, reject) => {

        // resolve with null when running in Node
        if (!window) resolve(null);

        const queryParameters = objectToQueryParams(params);
        const script = insertScriptElement(`${SDK_BASE_URL}?${queryParameters}`);

        script.addEventListener('load', () => {
            if (window.paypal) {
                return resolve(window.paypal);
            }

            return reject(new Error('window.paypal not available'));
        })

        script.addEventListener('error', () => {
            return reject(new Error('failed to load the paypal js sdk'));
        });
    })
}
