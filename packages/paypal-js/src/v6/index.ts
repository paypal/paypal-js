import { insertScriptElement } from "../utils";

const version = "__VERSION__";

type LoadScriptOptions = {
    environment?: "production" | "sandbox";
    debug?: boolean;
};

function loadCoreSdkScript(options: LoadScriptOptions = {}) {
    validateArguments(options);
    const { environment, debug } = options;

    // resolve with null when running in Node or Deno
    if (typeof document === "undefined") return Promise.resolve(null);

    const baseURL =
        environment === "sandbox"
            ? "https://www.sandbox.paypal.com"
            : "https://www.paypal.com";
    const url = new URL("/web-sdk/v6/core", baseURL);

    if (debug) {
        url.searchParams.append("debug", "true");
    }

    insertScriptElement({
        url: url.toString(),
        onSuccess: () => {
            if (!window.paypal) {
                return Promise.reject(
                    "The window.paypal global variable is not available",
                );
            }
            return Promise.resolve(window.paypal);
        },
        onError: () => {
            const defaultError = new Error(
                `The script "${url}" failed to load. Check the HTTP status code and response body in DevTools to learn more.`,
            );

            return Promise.reject(defaultError);
        },
    });
}

function validateArguments(options: unknown) {
    if (typeof options !== "object" || options === null) {
        throw new Error("Expected an options object");
    }
    const { environment } = options as LoadScriptOptions;

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
