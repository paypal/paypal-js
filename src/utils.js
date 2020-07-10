export function insertScriptElement(url) {
  const script = document.createElement('script');
  script.src = url;
  document.head.appendChild(script);

  return script;
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
