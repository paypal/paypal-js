export function findScript(url, dataAttributes) {
    const currentScript = document.querySelector(`script[src="${url}"]`);
    if (!currentScript) return null;

    const nextScript = createScriptElement(url, dataAttributes);
    let isExactMatch = true;

    forEachObjectKey(currentScript.dataset, key => {
        if (currentScript.dataset[key] !== nextScript.dataset[key]) {
            isExactMatch = false;
        }
    });

    forEachObjectKey(nextScript.dataset, key => {
        if (currentScript.dataset[key] !== nextScript.dataset[key]) {
            isExactMatch = false;
        }
    });

    return isExactMatch ? currentScript : null;
}

export function insertScriptElement({ url, dataAttributes, onSuccess, onError }) {
    const newScript = createScriptElement(url, dataAttributes);
    newScript.onerror = onError;
    newScript.onload = onSuccess;

    document.head.insertBefore(newScript, document.head.firstElementChild);
}

export function processOptions(options = {}) {
    const processedOptions = {
        queryParams: {},
        dataAttributes: {}
    };

    forEachObjectKey(options, key => {
        if (key.substring(0, 5) === 'data-') {
            processedOptions.dataAttributes[key] = options[key];
        } else {
            processedOptions.queryParams[key] = options[key];
        }
    });

    const { queryParams, dataAttributes } = processedOptions;

    return {
        queryString: objectToQueryString(queryParams),
        dataAttributes
    };
}

export function objectToQueryString(params) {
    let queryString = '';

    forEachObjectKey(params, key => {
        if (queryString.length !== 0) queryString += '&';
        queryString += key + '=' + params[key];
    });
    return queryString;
}

// uses es3 to avoid requiring polyfills for Array.prototype.forEach and Object.keys
function forEachObjectKey(obj, callback) {
    for (let key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            callback(key);
        }
    }
}

function createScriptElement(url, dataAttributes = {}) {
    const newScript = document.createElement('script');
    newScript.src = url;

    forEachObjectKey(dataAttributes, key => {
        newScript.setAttribute(key, dataAttributes[key]);
    });

    return newScript;
}
