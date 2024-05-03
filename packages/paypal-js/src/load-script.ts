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
    PromisePonyfill: PromiseConstructor = Promise
): Promise<PayPalNamespace | null> {
    validateArguments(options, PromisePonyfill);
    // resolve with null when running in Node or Deno
    if (typeof document === "undefined") return PromisePonyfill.resolve(null);

    if (!options.clientId) {
        throw new Error(
            `Expected clientId in options object: ${JSON.stringify(options)}`
        );
    }

    const { url, attributes } = processOptions(options);

    const namespace = attributes["data-namespace"] || "paypal";
    const existingWindowNamespace = getPayPalWindowNamespace(namespace);

    if (!attributes["data-js-sdk-library"]) {
        attributes["data-js-sdk-library"] = "paypal-js";
    }

    // resolve with the existing global paypal namespace when a script with the same params already exists
    if (findScript(url, attributes) && existingWindowNamespace) {
        return PromisePonyfill.resolve(existingWindowNamespace);
    }

    return loadCustomScript(
        {
            url,
            attributes: attributes,
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
    PromisePonyfill: PromiseConstructor = Promise
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
        // resolve with undefined when running in Node or Deno
        if (typeof document === "undefined") return resolve();

        insertScriptElement({
            url,
            attributes,
            onSuccess: () => resolve(),
            onError: () => {
                const defaultError = new Error(
                    `The script "${url}" failed to load. Check the HTTP status code and response body in DevTools to learn more.`
                );

                return reject(defaultError);
            },
        });
    });
}

function getPayPalWindowNamespace(namespace: string): PayPalNamespace {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (window as any)[namespace];
}

function validateArguments(options: unknown, PromisePonyfill?: unknown) {
    if (typeof options !== "object" || options === null) {
        throw new Error("Expected an options object.");
    }

    const { environment } = options as PayPalScriptOptions;

    if (
        environment &&
        environment !== "production" &&
        environment !== "sandbox"
    ) {
        throw new Error(
            'The `environment` option must be either "production" or "sandbox".'
        );
    }

    if (
        typeof PromisePonyfill !== "undefined" &&
        typeof PromisePonyfill !== "function"
    ) {
        throw new Error("Expected PromisePonyfill to be a function.");
    }
}
