export function findScript(url, dataAttributes) {
    const currentScript = document.querySelector(`script[src="${url}"]`);
    if (!currentScript) return null;

    const nextScript = createScriptElement(url, dataAttributes);

    // check if the new script has the same number of data attributes
    if (objectSize(currentScript.dataset) !== objectSize(nextScript.dataset)) {
        return null;
    }

    let isExactMatch = true;

    // check if the data attribute values are the same
    forEachObjectKey(currentScript.dataset, key => {
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
        queryParams,
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

function createScriptElement(url, dataAttributes = {}) {
    const newScript = document.createElement('script');
    newScript.src = url;

    forEachObjectKey(dataAttributes, key => {
        newScript.setAttribute(key, dataAttributes[key]);
    });

    return newScript;
}

// uses es3 to avoid requiring polyfills for Array.prototype.forEach and Object.keys
export function forEachObjectKey(obj, callback) {
    for (let key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            callback(key);
        }
    }
}

function objectSize(obj) {
    let size = 0;
    forEachObjectKey(obj, () => size++);
    return size;
}
