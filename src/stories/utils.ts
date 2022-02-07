import reactElementToJSXString from "react-element-to-jsx-string";
import format from "string-template";
import { SDK_QUERY_KEYS } from "@paypal/sdk-constants/dist/module";

import type { ReactNode } from "react";

// FIXME: problem with union on key
type TokenResponse = {
    [key in "clientToken" | "client_token"]: string;
} & { success?: boolean };

export const HEROKU_SERVER = "https://braintree-sdk-demo.herokuapp.com";
const CLIENT_TOKEN_URL = `${HEROKU_SERVER}/api/braintree/auth`;
const SALE_URL = `${HEROKU_SERVER}/api/braintree/sale`;
const allowedSDKQueryParams = Object.keys(SDK_QUERY_KEYS).map(
    (key) => SDK_QUERY_KEYS[key]
);

// paypal-js supports the sdkBaseURL param for testing in lower environments
allowedSDKQueryParams.push("sdkBaseURL");

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

export async function getClientToken(url = CLIENT_TOKEN_URL): Promise<string> {
    const response: TokenResponse = await (await fetch(url)).json();

    return response?.client_token || response?.clientToken;
}

export async function approveSale(
    nonce: string,
    amount: string
): Promise<unknown> {
    return await (
        await fetch(SALE_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                paymentMethodNonce: nonce,
                amount,
            }),
        })
    ).json();
}

export function generateRandomString(): string {
    return `uid_${Math.random().toString(36).substring(7)}`;
}

export function reactElementToString(source: ReactNode, ctx?: unknown): string {
    return reactElementToJSXString(source, {
        showFunctions: true,
        sortProps: false,
        functionValue: (fn) => format(fn.toString(), ctx),
    });
}

export function generateFundingSource(fundingSource?: string): string {
    return `fundingSource=${
        fundingSource ? `"${fundingSource}"` : "{undefined}"
    }`;
}
