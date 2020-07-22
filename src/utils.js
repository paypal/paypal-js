import { VALID_ATTRIBUTES, VALID_QUERY_PARAMETERS } from './constants';

function loadError() {
    throw new Error(`The script "${this.src}" didn't load correctly.`);
}

export function insertScriptElement({ url, attributes = {}, defer, callback }) {
    const newScript = document.createElement('script');
    newScript.onerror = loadError;
    if (callback) newScript.onload = callback;

    Object.keys(attributes).forEach(key => {
        newScript.setAttribute(key, attributes[key]);
    });

    document.head.appendChild(newScript);
    newScript.src = url;
    newScript.defer = defer;
}

export function findScript(url) {
    return document.querySelector(`script[src="${url}"]`);
}

export function processOptions(options) {
    const attributes = pickObjectProperties(options, VALID_ATTRIBUTES);
    const queryParameters = pickObjectProperties(options, VALID_QUERY_PARAMETERS);
    const queryString = objectToQueryString(queryParameters);

    return { attributes, queryString };
}

function pickObjectProperties(object, validKeys) {
    return Object.keys(object)
        .filter(key => validKeys.includes(key))
        .reduce((accumulator, key) => {
            accumulator[key] = object[key];
            return accumulator;
        }, {});
}

function objectToQueryString(params) {
    return Object.keys(params)
        .reduce((accumulator, key, currentIndex) => {
            if (currentIndex !== 0) accumulator += '&';

            return accumulator += `${key}=${params[key]}`;
        }, '');
}
