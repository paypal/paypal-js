import type { PayPalScriptOptions } from "../types/script-options";

interface StringMap {
    [key: string]: string;
}

export function findScript(
    url: string,
    dataAttributes?: StringMap
): HTMLScriptElement | null {
    const currentScript = document.querySelector<HTMLScriptElement>(
        `script[src="${url}"]`
    );
    if (currentScript === null) return null;

    const nextScript = createScriptElement(url, dataAttributes);

    // check if the new script has the same number of data attributes
    if (
        Object.keys(currentScript.dataset).length !==
        Object.keys(nextScript.dataset).length
    ) {
        return null;
    }

    let isExactMatch = true;

    // check if the data attribute values are the same
    Object.keys(currentScript.dataset).forEach((key) => {
        if (currentScript.dataset[key] !== nextScript.dataset[key]) {
            isExactMatch = false;
        }
    });

    return isExactMatch ? currentScript : null;
}

export interface ScriptElement {
    url: string;
    dataAttributes?: StringMap;
    onSuccess: () => void;
    onError: OnErrorEventHandler;
}

export function insertScriptElement({
    url,
    dataAttributes,
    onSuccess,
    onError,
}: ScriptElement): void {
    const newScript = createScriptElement(url, dataAttributes);
    newScript.onerror = onError;
    newScript.onload = onSuccess;

    document.head.insertBefore(newScript, document.head.firstElementChild);
}

export function processOptions(
    options: PayPalScriptOptions
): { url: string; dataAttributes: StringMap } {
    let sdkBaseURL = "https://www.paypal.com/sdk/js";

    if (options.sdkBaseURL) {
        sdkBaseURL = options.sdkBaseURL;
        delete options.sdkBaseURL;
    }

    interface ProcessedScriptOptions {
        queryParams: StringMap;
        dataAttributes: StringMap;
    }

    const processedOptions: ProcessedScriptOptions = {
        queryParams: {},
        dataAttributes: {},
    };

    Object.keys(options).forEach((key) => {
        const keyType =
            key.substring(0, 5) === "data-" ? "dataAttributes" : "queryParams";
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        processedOptions[keyType][key] = options[key]!.toString();
    });

    const { queryParams, dataAttributes } = processedOptions;

    return {
        url: `${sdkBaseURL}?${objectToQueryString(queryParams)}`,
        dataAttributes,
    };
}

export function objectToQueryString(params: StringMap): string {
    let queryString = "";

    Object.keys(params).forEach((key) => {
        if (queryString.length !== 0) queryString += "&";
        queryString += key + "=" + params[key];
    });
    return queryString;
}

function createScriptElement(
    url: string,
    dataAttributes: StringMap = {}
): HTMLScriptElement {
    const newScript: HTMLScriptElement = document.createElement("script");
    newScript.src = url;

    Object.keys(dataAttributes).forEach((key) => {
        newScript.setAttribute(key, dataAttributes[key]);

        if (key === "data-csp-nonce") {
            newScript.setAttribute("nonce", dataAttributes["data-csp-nonce"]);
        }
    });

    return newScript;
}
