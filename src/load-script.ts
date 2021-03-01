import { findScript, insertScriptElement, processOptions } from "./utils";
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
    PromisePonyfill?: PromiseConstructor
): Promise<PayPalNamespace | null> {
    validateArguments(options, PromisePonyfill);

    if (typeof PromisePonyfill === "undefined") {
        PromisePonyfill = getDefaultPromiseImplementation();
    }

    return new PromisePonyfill((resolve, reject) => {
        // resolve with null when running in Node
        if (typeof window === "undefined") return resolve(null);

        const { url, dataAttributes } = processOptions(options);
        const namespace = dataAttributes["data-namespace"] || "paypal";
        const existingWindowNamespace = getPayPalWindowNamespace(namespace);

        // resolve with the existing global paypal namespace when a script with the same params already exists
        if (findScript(url, dataAttributes) && existingWindowNamespace) {
            return resolve(existingWindowNamespace);
        }

        insertScriptElement({
            url,
            dataAttributes,
            onSuccess: () => {
                const newWindowNamespace = getPayPalWindowNamespace(namespace);

                if (newWindowNamespace) return resolve(newWindowNamespace);
                return reject(
                    new Error(
                        `The window.${namespace} global variable is not available.`
                    )
                );
            },
            onError: () => {
                return reject(
                    new Error(`The script "${url}" didn't load correctly.`)
                );
            },
        });
    });
}

function validateArguments(
    options: PayPalScriptOptions,
    PromisePonyfill?: PromiseConstructor
) {
    if (typeof options !== "object" || options === null) {
        throw new Error("Invalid arguments. Expected options to be an object.");
    }

    if (typeof PromisePonyfill === "undefined") {
        return;
    }

    if (typeof PromisePonyfill !== "function") {
        throw new Error(
            "Invalid arguments. Expected PromisePolyfill to be a function."
        );
    }
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
