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
    const currentScriptDataset = Object.assign({}, currentScript.dataset);
    delete currentScriptDataset.uidAuto;

    // check if the new script has the same number of data attributes
    if (
        Object.keys(currentScriptDataset).length !==
        Object.keys(nextScript.dataset).length
    ) {
        return null;
    }

    let isExactMatch = true;

    // check if the data attribute values are the same
    Object.keys(currentScriptDataset).forEach((key) => {
        if (currentScriptDataset[key] !== nextScript.dataset[key]) {
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

    const processedMerchantIDAttributes = processMerchantID(
        options["merchant-id"],
        options["data-merchant-id"]
    );

    const newOptions = Object.assign(
        {},
        options,
        processedMerchantIDAttributes
    ) as PayPalScriptOptions;

    const { queryParams, dataAttributes } = Object.keys(newOptions)
        .filter((key) => {
            return (
                typeof newOptions[key] !== "undefined" &&
                newOptions[key] !== null &&
                newOptions[key] !== ""
            );
        })
        .reduce(
            (accumulator, key) => {
                const value = newOptions[key].toString();

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
 * Parse the error message code received from the server during the scrip load.
 * The response is always an error.
 * This function execute the received string code.
 * NOTE: Server response example: throw new Error("detail message");
 * 
 * @param source the received error response from the server
 * @throw {Error} server error message
 * @returns a string or throw the exception
 */
export function parseErrorMessage(source: string): string {
    return Function(`'use strict'; ${source}`)();
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

function processMerchantID(
    merchantID: string[] | string | undefined,
    dataMerchantID: string | undefined
): {
    "merchant-id": string | undefined;
    "data-merchant-id": string | undefined;
} {
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

    return {
        "merchant-id": newMerchantID,
        "data-merchant-id": newDataMerchantID,
    };
}
