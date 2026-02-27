import { insertScriptElement, isServer } from "../utils";
import type {
    PayPalV6Namespace,
    LoadCoreSdkScriptOptions,
} from "../../types/v6/index";

const version = "__VERSION__";

function loadCoreSdkScript(options: LoadCoreSdkScriptOptions = {}) {
    validateArguments(options);
    const isServerEnv = isServer();

    // Early resolve in SSR environments where DOM APIs are unavailable
    if (isServerEnv) {
        return Promise.resolve(null);
    }

    const currentScript = document.querySelector<HTMLScriptElement>(
        'script[src*="/web-sdk/v6/core"]',
    );
    const windowNamespace = options.dataNamespace ?? "paypal";

    // Script already loaded and namespace is available — return immediately
    if (
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as Record<string, any>)[windowNamespace]?.version?.startsWith(
            "6",
        ) &&
        currentScript
    ) {
        return Promise.resolve(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (window as Record<string, any>)[
                windowNamespace
            ] as unknown as PayPalV6Namespace,
        );
    }

    // Script tag exists but hasn't finished loading yet (e.g., React StrictMode double-invoke)
    if (currentScript) {
        return new Promise<PayPalV6Namespace>((resolve, reject) => {
            const namespace = options.dataNamespace ?? "paypal";
            currentScript.addEventListener(
                "load",
                () => {
                    const paypalSDK = (
                        window as unknown as Record<string, unknown>
                    )[namespace] as PayPalV6Namespace | undefined;
                    if (paypalSDK) {
                        resolve(paypalSDK);
                    } else {
                        reject(
                            `The window.${namespace} global variable is not available`,
                        );
                    }
                },
                { once: true },
            );
            currentScript.addEventListener(
                "error",
                () => {
                    reject(new Error(`The PayPal SDK script failed to load.`));
                },
                { once: true },
            );
        });
    }

    const { environment, debug, dataNamespace, dataSdkIntegrationSource } =
        options;
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

    if (dataSdkIntegrationSource) {
        attributes["data-sdk-integration-source"] = dataSdkIntegrationSource;
    }

    // No existing script found — insert a new one and wait for it to load
    return new Promise<PayPalV6Namespace>((resolve, reject) => {
        insertScriptElement({
            url: url.toString(),
            attributes,
            onSuccess: () => {
                const namespace = dataNamespace ?? "paypal";
                const paypalSDK = (
                    window as unknown as Record<string, unknown>
                )[namespace] as PayPalV6Namespace | undefined;

                if (!paypalSDK) {
                    return reject(
                        `The window.${namespace} global variable is not available`,
                    );
                }
                return resolve(paypalSDK);
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
    const { environment, dataNamespace, dataSdkIntegrationSource } =
        options as LoadCoreSdkScriptOptions;

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

    if (
        dataSdkIntegrationSource !== undefined &&
        dataSdkIntegrationSource.trim() === ""
    ) {
        throw new Error(
            'The "dataSdkIntegrationSource" option cannot be an empty string',
        );
    }
}

export { loadCoreSdkScript, version };
