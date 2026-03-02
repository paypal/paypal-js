import { isServer } from "../utils";
import type {
    PayPalV6Namespace,
    LoadCoreSdkScriptOptions,
} from "../../types/v6/index";

const version = "__VERSION__";

const SCRIPT_LOADING_STATE = {
    PENDING: "pending",
    RESOLVED: "resolved",
    REJECTED: "rejected",
} as const;

const DATA_ATTRIBUTE_LOADING_STATE = "data-loading-state";

function loadCoreSdkScript(options: LoadCoreSdkScriptOptions = {}) {
    validateArguments(options);

    if (isServer()) {
        return Promise.resolve(null);
    }

    const { environment, debug, dataNamespace, dataSdkIntegrationSource } =
        options;
    const namespace = dataNamespace ?? "paypal";
    const paypalWindowReference = getPayPalWindowNamespace(namespace);
    if (paypalWindowReference?.version.startsWith("6")) {
        return Promise.resolve(paypalWindowReference);
    }

    const baseURL =
        environment === "production"
            ? "https://www.paypal.com"
            : "https://www.sandbox.paypal.com";
    const url = new URL("/web-sdk/v6/core", baseURL);

    if (debug) {
        url.searchParams.append("debug", "true");
    }

    console.log(
        "existing script",
        `script[src*="${url.pathname}"][${DATA_ATTRIBUTE_LOADING_STATE}="${SCRIPT_LOADING_STATE.PENDING}"]`,
    );
    console.log("innerHTML", document.head.innerHTML);

    const scriptElement =
        document.querySelector<HTMLScriptElement>(
            `script[src*="${url.pathname}"][${DATA_ATTRIBUTE_LOADING_STATE}="${SCRIPT_LOADING_STATE.PENDING}"]`,
        ) ??
        createScriptElement({
            url: url.toString(),
            attributes: {
                "data-namespace": dataNamespace,
                "data-sdk-integration-source": dataSdkIntegrationSource,
                [DATA_ATTRIBUTE_LOADING_STATE]: SCRIPT_LOADING_STATE.PENDING,
            },
        });

    return new Promise<PayPalV6Namespace>((resolve, reject) => {
        scriptElement.addEventListener("load", () => {
            const paypalWindowReference = getPayPalWindowNamespace(namespace);

            if (!paypalWindowReference) {
                scriptElement.setAttribute(
                    DATA_ATTRIBUTE_LOADING_STATE,
                    SCRIPT_LOADING_STATE.REJECTED,
                );

                return reject(
                    `The window.${namespace} global variable is not available`,
                );
            }
            scriptElement.setAttribute(
                DATA_ATTRIBUTE_LOADING_STATE,
                SCRIPT_LOADING_STATE.RESOLVED,
            );
            return resolve(paypalWindowReference);
        });

        scriptElement.addEventListener("error", () => {
            const defaultError = new Error(
                `The script "${url.toString()}" failed to load. Check the HTTP status code and response body in DevTools to learn more.`,
            );

            scriptElement.setAttribute(
                DATA_ATTRIBUTE_LOADING_STATE,
                SCRIPT_LOADING_STATE.REJECTED,
            );
            return reject(defaultError);
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

function getPayPalWindowNamespace(
    namespace: string,
): PayPalV6Namespace | undefined {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (window as any)[namespace];
}

function createScriptElement({
    url,
    attributes,
}: {
    url: string;
    attributes: Record<string, string | undefined>;
}) {
    const newScript = document.createElement("script");
    newScript.src = url;

    for (const [key, value] of Object.entries(attributes)) {
        if (value !== undefined) {
            newScript.setAttribute(key, value);
        }
    }

    document.head.appendChild(newScript);
    return newScript;
}

export { loadCoreSdkScript, version };
