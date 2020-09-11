export function findScript(url) {
    return document.querySelector(`script[src="${url}"]`);
}

export function insertScriptElement({ url, dataAttributes = {}, onSuccess, onError }) {
    const newScript = document.createElement('script');
    newScript.onerror = onError;
    newScript.onload = onSuccess;

    forEachObjectKey(dataAttributes, key => {
        newScript.setAttribute(key, dataAttributes[key]);
    });

    newScript.src = url;
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
