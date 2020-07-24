function loadError() {
    throw new Error(`The script "${this.src}" didn't load correctly.`);
}

export function insertScriptElement({ url, attributes = {}, properties = {}, callback }) {
    const newScript = document.createElement('script');
    newScript.onerror = loadError;
    if (callback) newScript.onload = callback;

    Object.keys(attributes).forEach(key => {
        newScript.setAttribute(key, attributes[key]);
    });

    document.head.appendChild(newScript);
    newScript.src = url;
    newScript.defer = properties.defer === undefined ? true : properties.defer;
}

export function processOptions(options) {
    const { queryParams, attributes, properties } = Object.keys(options)
        .reduce((accumulator, key) => {
            if (key.startsWith('data-')) {
                accumulator.attributes[key] = options[key];
            } else if (key === 'defer') {
                accumulator.properties[key] = options[key];
            } else {
                accumulator.queryParams[key] = options[key];
            }
            return accumulator;
        }, { queryParams: {}, attributes: {}, properties: {} });

    return {
        queryString: objectToQueryString(queryParams),
        attributes,
        properties
    };
}

export function objectToQueryString(params) {
    return Object.keys(params)
        .reduce((accumulator, key, currentIndex) => {
            if (currentIndex !== 0) accumulator += '&';

            return accumulator += `${key}=${params[key]}`;
        }, '');
}
