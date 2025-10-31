import { insertScriptElement } from "../utils";
import type {
    PayPalV6Namespace,
    LoadCoreSdkScriptOptions,
} from "../../types/v6/index";
import { as } from "vitest/dist/reporters-O4LBziQ_.js";

const version = "__VERSION__";

function loadCoreSdkScript(options: LoadCoreSdkScriptOptions = {}) {
    validateArguments(options);
    const { environment, debug, dataNamespace } = options;
    const attributes: Record<string, string> = {};

    const baseURL =
        environment === "production"
            ? "https://www.paypal.com"
            : "https://www.sandbox.paypal.com";
    const url = new URL("/web-sdk/v6/core", baseURL);

    if (debug) {
        url.searchParams.append("debug", "true");
    }

    if (dataNamespace) {
        attributes["data-namespace"] = dataNamespace;
    }

    return new Promise<PayPalV6Namespace>((resolve, reject) => {
        insertScriptElement({
            url: url.toString(),
            attributes,
            onSuccess: () => {
                const namespace = dataNamespace ?? "paypal";
                const paypalSDK = getPayPalWindowNamespace(namespace);

                if (!paypalSDK) {
                    return reject(
                        `The window.${namespace} global variable is not available`,
                    );
                }
                return resolve(paypalSDK as PayPalV6Namespace);
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
    const { environment, dataNamespace } = options as LoadCoreSdkScriptOptions;

    if (
        environment &&
        environment !== "production" &&
        environment !== "sandbox"
    ) {
        throw new Error(
            'The "environment" option must be either "production" or "sandbox"',
        );
    }

    if (dataNamespace !== undefined && dataNamespace.trim() === "") {
        throw new Error('The "dataNamespace" option cannot be an empty string');
    }
}

function getPayPalWindowNamespace(namespace: string): unknown {
    const win = window as unknown as Record<string, unknown>;
    return win[namespace];
}

export { loadCoreSdkScript, version };
