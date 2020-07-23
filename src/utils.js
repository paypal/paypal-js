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

export function findScript(url) {
    return document.querySelector(`script[src="${url}"]`);
}

export function objectToQueryString(params) {
    return Object.keys(params)
        .reduce((accumulator, key, currentIndex) => {
            if (currentIndex !== 0) accumulator += '&';

            return accumulator += `${key}=${params[key]}`;
        }, '');
}
