import {
    findScript,
    insertScriptElement,
    processOptions,
    parseErrorMessage,
} from "./utils";
import type { PayPalScriptOptions } from "../types/script-options";
import type { PayPalNamespace } from "../types/index";

/**
 * Load the Paypal JS SDK script asynchronously.
 *
 * @param {Object} options - used to configure query parameters and data attributes for the JS SDK.
 * @param {PromiseConstructor} [PromisePonyfill=window.Promise] - optional Promise Constructor ponyfill.
 * @return {Promise<Object>} paypalObject - reference to the global window PayPal object.
 */
export function loadScript(
    options: PayPalScriptOptions,
    PromisePonyfill: PromiseConstructor = getDefaultPromiseImplementation()
): Promise<PayPalNamespace | null> {
    validateArguments(options, PromisePonyfill);

    // resolve with null when running in Node
    if (typeof window === "undefined") return PromisePonyfill.resolve(null);

    const { url, dataAttributes } = processOptions(options);
    const namespace = dataAttributes["data-namespace"] || "paypal";
    const existingWindowNamespace = getPayPalWindowNamespace(namespace);

    // resolve with the existing global paypal namespace when a script with the same params already exists
    if (findScript(url, dataAttributes) && existingWindowNamespace) {
        return PromisePonyfill.resolve(existingWindowNamespace);
    }

    return loadCustomScript(
        {
            url,
            attributes: dataAttributes,
        },
        PromisePonyfill
    ).then(() => {
        const newWindowNamespace = getPayPalWindowNamespace(namespace);

        if (newWindowNamespace) {
            return newWindowNamespace;
        }

        throw new Error(
            `The window.${namespace} global variable is not available.`
        );
    });
}

/**
 * Load a custom script asynchronously.
 *
 * @param {Object} options - used to set the script url and attributes.
 * @param {PromiseConstructor} [PromisePonyfill=window.Promise] - optional Promise Constructor ponyfill.
 * @return {Promise<void>} returns a promise to indicate if the script was successfully loaded.
 */
export function loadCustomScript(
    options: {
        url: string;
        attributes?: Record<string, string>;
    },
    PromisePonyfill: PromiseConstructor = getDefaultPromiseImplementation()
): Promise<void> {
    validateArguments(options, PromisePonyfill);

    const { url, attributes } = options;

    if (typeof url !== "string" || url.length === 0) {
        throw new Error("Invalid url.");
    }

    if (typeof attributes !== "undefined" && typeof attributes !== "object") {
        throw new Error("Expected attributes to be an object.");
    }

    return new PromisePonyfill((resolve, reject) => {
        // resolve with undefined when running in Node
        if (typeof window === "undefined") return resolve();

        insertScriptElement({
            url,
            attributes,
            onSuccess: () => resolve(),
            onError: () => {
                const defaultError = `The script "${url}" failed to load.`;

                if (!window.fetch) {
                    return reject(defaultError);
                }
                // attempt to fetch() the error reason from the response body
                return fetch(url)
                    .then((response): void | string | Promise<string> => {
                        return response.status === 200
                            ? reject(defaultError)
                            : response.text();
                    })
                    .then((message) =>
                        reject(parseErrorMessage(message as string))
                    )
                    .catch((err) => {
                        reject(err.message || defaultError);
                    });
            },
        });
    });
}

function getDefaultPromiseImplementation() {
    if (typeof Promise === "undefined") {
        throw new Error(
            "Promise is undefined. To resolve the issue, use a Promise polyfill."
        );
    }
    return Promise;
}

function getPayPalWindowNamespace(namespace: string): PayPalNamespace {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (window as any)[namespace];
}

function validateArguments(options: unknown, PromisePonyfill?: unknown) {
    if (typeof options !== "object" || options === null) {
        throw new Error("Expected an options object.");
    }

    if (
        typeof PromisePonyfill !== "undefined" &&
        typeof PromisePonyfill !== "function"
    ) {
        throw new Error("Expected PromisePonyfill to be a function.");
    }
}
