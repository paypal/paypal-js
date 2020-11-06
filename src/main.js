import Promise from 'promise-polyfill';
import { findScript, insertScriptElement, processOptions, forEachObjectKey } from './utils';

const SDK_BASE_URL = 'https://www.paypal.com/sdk/js';
let loadingPromise;
let isLoading = false;

export function loadScript(options) {
    // resolve with the existing promise when the script is loading
    if (isLoading) return loadingPromise;

    return loadingPromise = new Promise((resolve, reject) => {
        // resolve with null when running in Node
        if (typeof window === 'undefined') return resolve(null);

        const { queryString, dataAttributes } = processOptions(options);
        const url = `${SDK_BASE_URL}?${queryString}`;

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

export function appendScript(options) {
    return new Promise((resolve, reject) => {
        // resolve with null when running in Node
        if (typeof window === 'undefined') return resolve(null);

        const existingScript = document.querySelector(`script[src^="${SDK_BASE_URL}"]`);

        // reject when the JS SDK isn't found on the page
        if (existingScript === null) {
            return reject('Failed to find an existing JS SDK <script> element');
        }

        const { queryParams, dataAttributes } = processOptions(options);

        let newSrc = existingScript.src;

        forEachObjectKey(queryParams, queryParamKey => {
            const keyValue = `${queryParamKey}=${queryParams[queryParamKey]}`;

            if (newSrc.indexOf(queryParamKey) > -1) {
                newSrc = newSrc.replace(new RegExp(`${queryParamKey}=[^&]*`, "g"), keyValue);
            } else {
                newSrc += `&${keyValue}`;
            }
        });

        // TODO: add support for data-attributes

        insertScriptElement({
            url: newSrc,
            dataAttributes,
            onSuccess: () => {
                isLoading = false;
                if (window.paypal) return resolve(window.paypal);
                return reject(new Error('The window.paypal global variable is not available.'));
            },
            onError: () => {
                isLoading = false;
                return reject(new Error(`The script "${newSrc}" didn't load correctly.`));
            }
        });
    });
}

// replaced with the package.json version at build time
export const version = '__VERSION__';
