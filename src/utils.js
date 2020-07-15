function loadError() {
    throw new Error(`The script "${this.src}" didn't load correctly.`);
}

export function insertScriptElement(url, onloadFunction) {
    const newScript = document.createElement('script');
    newScript.onerror = loadError;
    if (onloadFunction) newScript.onload = onloadFunction;
    document.head.appendChild(newScript);
    newScript.src = url;
}

export function camelCaseToCabobCase(string) {
    return string
        .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
        .replace(/([A-Z])([A-Z])(?=[a-z])/g, '$1-$2')
        .toLowerCase();
}

export function objectToQueryParams(params) {
    return Object.keys(params)
        .reduce((accumulator, currentValue, currentIndex) => {
            if (currentIndex !== 0) accumulator += '&';

            return accumulator += `${camelCaseToCabobCase(currentValue)}=${params[currentValue]}`;
        }, '');
}
