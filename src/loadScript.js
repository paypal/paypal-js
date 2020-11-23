import { findScript, insertScriptElement, processOptions } from './utils';

const SDK_BASE_URL = 'https://www.paypal.com/sdk/js';
let loadingPromise;
let isLoading = false;

export default function loadScript(options, PromisePonyfill) {
    // resolve with the existing promise when the script is loading
    if (isLoading) return loadingPromise;

    if (typeof PromisePonyfill === 'undefined') {
        // default to using window.Promise as the Promise implementation
        if (typeof Promise === 'undefined') {
            throw new Error('Failed to load the PayPal JS SDK script because Promise is undefined. To resolve the issue, use a Promise polyfill.');
        }

        PromisePonyfill = Promise;
    }

    return loadingPromise = new PromisePonyfill((resolve, reject) => {
        // resolve with null when running in Node
        if (typeof window === 'undefined') return resolve(null);

        const { queryString, dataAttributes } = processOptions(options);
        const sdkBaseURL = options.sdkBaseURL || SDK_BASE_URL;
        const url = `${sdkBaseURL}?${queryString}`;

        // resolve with the existing global paypal object when a script with the same src already exists
        if (findScript(url, dataAttributes) && window.paypal) return resolve(window.paypal);

        isLoading = true;

        insertScriptElement({
            url,
            dataAttributes,
            onSuccess: () => {
                isLoading = false;
                if (window.paypal) return resolve(window.paypal);
                return reject(new Error('The window.paypal global variable is not available.'));
            },
            onError: () => {
                isLoading = false;
                return reject(new Error(`The script "${url}" didn't load correctly.`));
            }
        });
    });
}
