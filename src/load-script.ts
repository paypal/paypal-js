import { findScript, insertScriptElement, processOptions } from "./utils";
import type { PayPalScriptOptions } from "../types/script-options";
import type { PayPalNamespace } from "../types/index";

type PromiseResults = Promise<PayPalNamespace | null>;

declare global {
    interface Window {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        [key: string]: any;
        paypal?: PayPalNamespace;
    }
}

export default function loadScript(
    options: PayPalScriptOptions,
    PromisePonyfill?: PromiseConstructor
): PromiseResults {
    if (!(options instanceof Object)) {
        throw new Error(
            "Invalid arguments. Expected an object to be passed into loadScript()."
        );
    }

    if (typeof PromisePonyfill === "undefined") {
        // default to using window.Promise as the Promise implementation
        if (typeof Promise === "undefined") {
            throw new Error(
                "Failed to load the PayPal JS SDK script because Promise is undefined. To resolve the issue, use a Promise polyfill."
            );
        }

        PromisePonyfill = Promise;
    }

    return new PromisePonyfill((resolve, reject) => {
        // resolve with null when running in Node
        if (typeof window === "undefined") return resolve(null);

        const { url, dataAttributes } = processOptions(options);
        const namespace = dataAttributes["data-namespace"] || "paypal";

        // resolve with the existing global paypal namespace when a script with the same params already exists
        if (findScript(url, dataAttributes) && window[namespace]) {
            return resolve(window[namespace]);
        }

        insertScriptElement({
            url,
            dataAttributes,
            onSuccess: () => {
                if (window[namespace]) return resolve(window[namespace]);
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
