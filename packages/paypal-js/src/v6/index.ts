import { insertScriptElement, isServer } from "../utils";
import type {
    PayPalV6Namespace,
    LoadCoreSdkScriptOptions,
} from "../../types/v6/index";

const version = "__VERSION__";

function loadCoreSdkScript(options: LoadCoreSdkScriptOptions = {}) {
    validateArguments(options);

    // SSR safeguard
    if (typeof document === "undefined") {
        return Promise.resolve(null);
    }

    const { environment, debug } = options;

    const baseURL =
        environment === "production"
            ? "https://www.paypal.com"
            : "https://www.sandbox.paypal.com";
    const url = new URL("/web-sdk/v6/core", baseURL);

    if (debug) {
        url.searchParams.append("debug", "true");
    }

    return new Promise<PayPalV6Namespace>((resolve, reject) => {
        insertScriptElement({
            url: url.toString(),
            onSuccess: () => {
                if (isServer || !window.paypal) {
                    return reject(
                        "The window.paypal global variable is not available",
                    );
                }
                return resolve(window.paypal as unknown as PayPalV6Namespace);
            },
            onError: () => {
                const defaultError = new Error(
                    `The script "${url}" failed to load. Check the HTTP status code and response body in DevTools to learn more.`,
                );

                return reject(defaultError);
            },
        });
    });
}

function validateArguments(options: unknown) {
    if (typeof options !== "object" || options === null) {
        throw new Error("Expected an options object");
    }
    const { environment } = options as LoadCoreSdkScriptOptions;

    if (
        environment &&
        environment !== "production" &&
        environment !== "sandbox"
    ) {
        throw new Error(
            'The "environment" option must be either "production" or "sandbox"',
        );
    }
}

export { loadCoreSdkScript, version };
