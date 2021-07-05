import { SDK_QUERY_KEYS } from "@paypal/sdk-constants/dist/module";

const allowedSDKQueryParams = Object.keys(SDK_QUERY_KEYS).map(
    (key) => SDK_QUERY_KEYS[key]
);

export function getOptionsFromQueryString(): Record<string, unknown> {
    const searchParams = new URLSearchParams(window.location.search) || [];

    return Array.from(searchParams)
        .filter(([key]) => {
            return allowedSDKQueryParams.includes(key);
        })
        .reduce((acc: Record<string, unknown>, [key, value]) => {
            acc[key] = value;
            return acc;
        }, {});
}

export function generateRandomString(): string {
    return `uid_${Math.random().toString(36).substring(7)}`;
}
