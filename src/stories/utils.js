const StorybookQueryParametersToIgnore = ["path", "id", "args", "viewMode"];

export function getOptionsFromQueryString() {
    const searchParams = new URLSearchParams(window.location.search) || [];

    return Array.from(searchParams)
        .filter(([key]) => {
            return !StorybookQueryParametersToIgnore.includes(key);
        })
        .reduce((acc, [key, value]) => {
            acc[key] = value;
            return acc;
        }, {});
}
