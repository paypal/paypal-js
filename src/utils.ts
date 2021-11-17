import type { PayPalScriptOptions } from "../types/script-options";

type StringMap = Record<string, string>;

export function findScript(
    url: string,
    attributes?: StringMap
): HTMLScriptElement | null {
    const currentScript = document.querySelector<HTMLScriptElement>(
        `script[src="${url}"]`
    );
    if (currentScript === null) return null;

    const nextScript = createScriptElement(url, attributes);

    // ignore the data-uid-auto attribute that gets auto-assigned to every script tag
    const currentScriptClone = currentScript.cloneNode() as HTMLScriptElement;
    delete currentScriptClone.dataset.uidAuto;

    // check if the new script has the same number of data attributes
    if (
        Object.keys(currentScriptClone.dataset).length !==
        Object.keys(nextScript.dataset).length
    ) {
        return null;
    }

    let isExactMatch = true;

    // check if the data attribute values are the same
    Object.keys(currentScriptClone.dataset).forEach((key) => {
        if (currentScriptClone.dataset[key] !== nextScript.dataset[key]) {
            isExactMatch = false;
        }
    });

    return isExactMatch ? currentScript : null;
}

export interface ScriptElement {
    url: string;
    attributes?: StringMap;
    onSuccess: () => void;
    onError: OnErrorEventHandler;
}

export function insertScriptElement({
    url,
    attributes,
    onSuccess,
    onError,
}: ScriptElement): void {
    const newScript = createScriptElement(url, attributes);
    newScript.onerror = onError;
    newScript.onload = onSuccess;

    document.head.insertBefore(newScript, document.head.firstElementChild);
}

export function processOptions(options: PayPalScriptOptions): {
    url: string;
    dataAttributes: StringMap;
} {
    let sdkBaseURL = "https://www.paypal.com/sdk/js";

    if (options.sdkBaseURL) {
        sdkBaseURL = options.sdkBaseURL;
        delete options.sdkBaseURL;
    }

    processMerchantID(options);

    const { queryParams, dataAttributes } = Object.keys(options)
        .filter((key) => {
            return (
                typeof options[key] !== "undefined" &&
                options[key] !== null &&
                options[key] !== ""
            );
        })
        .reduce(
            (accumulator, key) => {
                const value = options[key].toString();

                if (key.substring(0, 5) === "data-") {
                    accumulator.dataAttributes[key] = value;
                } else {
                    accumulator.queryParams[key] = value;
                }
                return accumulator;
            },
            {
                queryParams: {} as StringMap,
                dataAttributes: {} as StringMap,
            }
        );

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

/**
 * Parse the error message code received from the server during the script load.
 * This function search for the occurrence of this specific string "/* Original Error:".
 *
 * @param message the received error response from the server
 * @returns the content of the message if the string string was found.
 *          The whole message otherwise
 */
export function parseErrorMessage(message: string): string {
    const originalErrorText = message.split("/* Original Error:")[1];

    return originalErrorText
        ? originalErrorText.replace(/\n/g, "").replace("*/", "").trim()
        : message;
}

function createScriptElement(
    url: string,
    attributes: StringMap = {}
): HTMLScriptElement {
    const newScript: HTMLScriptElement = document.createElement("script");
    newScript.src = url;

    Object.keys(attributes).forEach((key) => {
        newScript.setAttribute(key, attributes[key]);

        if (key === "data-csp-nonce") {
            newScript.setAttribute("nonce", attributes["data-csp-nonce"]);
        }
    });

    return newScript;
}

function processMerchantID(options: PayPalScriptOptions): PayPalScriptOptions {
    const { "merchant-id": merchantID, "data-merchant-id": dataMerchantID } =
        options;

    let newMerchantID = "";
    let newDataMerchantID = "";

    if (Array.isArray(merchantID)) {
        if (merchantID.length > 1) {
            newMerchantID = "*";
            newDataMerchantID = merchantID.toString();
        } else {
            newMerchantID = merchantID.toString();
        }
    } else if (typeof merchantID === "string" && merchantID.length > 0) {
        newMerchantID = merchantID;
    } else if (
        typeof dataMerchantID === "string" &&
        dataMerchantID.length > 0
    ) {
        newMerchantID = "*";
        newDataMerchantID = dataMerchantID;
    }

    options["merchant-id"] = newMerchantID;
    options["data-merchant-id"] = newDataMerchantID;

    return options;
}
