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

    Object.keys(dataAttributes).forEach(key => {
        newScript.setAttribute(key, dataAttributes[key]);
    });

    document.head.insertBefore(newScript, document.head.firstElementChild);

    newScript.src = url;
    newScript.defer = scriptAttributes.defer === undefined ? true : scriptAttributes.defer;
}

export function processOptions(options = {}) {
    const { queryParams, dataAttributes, scriptAttributes } = Object.keys(options)
        .reduce((accumulator, key) => {
            if (key.startsWith('data-')) {
                accumulator.dataAttributes[key] = options[key];
            } else if (key === 'defer') {
                accumulator.scriptAttributes[key] = options[key];
            } else {
                accumulator.queryParams[key] = options[key];
            }
            return accumulator;
        }, { queryParams: {}, dataAttributes: {}, scriptAttributes: {} });

    return {
        queryString: objectToQueryString(queryParams),
        dataAttributes,
        scriptAttributes
    };
}

export function objectToQueryString(params) {
    return Object.keys(params)
        .reduce((accumulator, key, currentIndex) => {
            if (currentIndex !== 0) accumulator += '&';

            return accumulator += `${key}=${params[key]}`;
        }, '');
}
