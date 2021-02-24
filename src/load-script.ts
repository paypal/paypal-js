import { findScript, insertScriptElement, processOptions } from "./utils";
import type { PayPalScriptOptions } from "../types/script-options";
import type { PayPalNamespace } from "../types/index";

type PromiseResults = Promise<PayPalNamespace | null>;
let loadingPromise: PromiseResults;

declare global {
    interface Window {
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

    return (loadingPromise = new PromisePonyfill((resolve, reject) => {
        // resolve with null when running in Node
        if (typeof window === "undefined") return resolve(null);

        const { url, dataAttributes } = processOptions(options);

        // resolve with the existing global paypal object when a script with the same src already exists
        if (findScript(url, dataAttributes) && window.paypal)
            return resolve(window.paypal);

        insertScriptElement({
            url,
            dataAttributes,
            onSuccess: () => {
                const namespace = dataAttributes.dataNamespace || "paypal";

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
    }));
}
