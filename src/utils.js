function loadError() {
    throw new Error(`The script "${this.src}" didn't load correctly.`);
}

export function findScript(url) {
    return document.querySelector(`script[src="${url}"]`);
}

export function insertScriptElement({ url, dataAttributes = {}, scriptAttributes = {}, callback }) {
    const newScript = document.createElement('script');
    newScript.onerror = loadError;
    if (callback) newScript.onload = callback;

    forEachObjectKey(dataAttributes, key => {
        newScript.setAttribute(key, dataAttributes[key]);
    });

    document.head.insertBefore(newScript, document.head.firstElementChild);

    newScript.src = url;
    newScript.async = scriptAttributes.async ?? true;
    newScript.defer = scriptAttributes.defer ?? true;
}

export function processOptions(options = {}) {
    const processedOptions = {
        queryParams: {},
        dataAttributes: {},
        scriptAttributes: {}
    };

    forEachObjectKey(options, key => {
        if (key.substring(0, 5) === 'data-') {
            processedOptions.dataAttributes[key] = options[key];
        } else if (key === 'defer' || key === 'async') {
            processedOptions.scriptAttributes[key] = options[key];
        } else {
            processedOptions.queryParams[key] = options[key];
        }
    });

    const { queryParams, dataAttributes, scriptAttributes } = processedOptions;

    return {
        queryString: objectToQueryString(queryParams),
        dataAttributes,
        scriptAttributes
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
        if (obj.hasOwnProperty(key)) {
            callback(key);
        }
    }
}
