import { SDK_QUERY_KEYS } from "@paypal/sdk-constants/dist/module";

const allowedSDKQueryParams = Object.keys(SDK_QUERY_KEYS).map(
    (key) => SDK_QUERY_KEYS[key]
);

export function getOptionsFromQueryString(): Record<string, string> {
    const searchParams = new URLSearchParams(window.location.search);
    const validOptions: Record<string, string> = {};

    searchParams.forEach((value, key) => {
        if (allowedSDKQueryParams.includes(key)) {
            validOptions[key] = value;
        }
    });

    return validOptions;
}

export function generateRandomString(): string {
    return `uid_${Math.random().toString(36).substring(7)}`;
}
