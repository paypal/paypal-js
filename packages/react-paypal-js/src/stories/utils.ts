import reactElementToJSXString from "react-element-to-jsx-string";
import format from "string-template";
import { SDK_QUERY_KEYS } from "@paypal/sdk-constants/dist/module";

import type { ReactNode } from "react";
import type { OrderResponseBody } from "@paypal/paypal-js";

// FIXME: problem with union on key
type TokenResponse = {
    [key in "clientToken" | "client_token"]: string;
} & { success?: boolean };

export const FLY_SERVER = "https://react-paypal-js-storybook.fly.dev";
export const CREATE_ORDER_URL = `${FLY_SERVER}/api/paypal/create-order`;
export const CAPTURE_ORDER_URL = `${FLY_SERVER}/api/paypal/capture-order`;

const CLIENT_TOKEN_URL = `${FLY_SERVER}/api/braintree/generate-client-token`;
const SALE_URL = `${FLY_SERVER}/api/braintree/sale`;
const allowedSDKQueryParams = Object.keys(SDK_QUERY_KEYS).map(
    (key) => SDK_QUERY_KEYS[key],
);

// paypal-js supports the sdkBaseUrl param for testing in lower environments
allowedSDKQueryParams.push("sdkBaseUrl");

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
    const response: TokenResponse = await (
        await fetch(url, { method: "POST" })
    ).json();

    return response?.client_token || response?.clientToken;
}

export async function approveSale(
    nonce: string,
    amount: string,
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

export function createOrder(
    cart: { sku: string; quantity: number }[],
): Promise<OrderResponseBody> {
    return fetch(CREATE_ORDER_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        // use the "body" param to optionally pass additional order information
        // like product ids and quantities
        body: JSON.stringify({ cart }),
    }).then((response) => response.json());
}

export function onApprove(data: {
    orderID: string;
}): Promise<OrderResponseBody> {
    return fetch(CAPTURE_ORDER_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            orderID: data.orderID,
        }),
    }).then((response) => response.json());
}
