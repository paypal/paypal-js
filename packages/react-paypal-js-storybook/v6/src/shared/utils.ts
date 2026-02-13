/**
 * Shared utilities for V6 Storybook stories.
 *
 * Single Source of Truth for:
 * - Sample integration server URL
 * - Order creation/capture functions
 * - Vault token creation functions
 * - Shared callbacks for one-time and save payments
 * - Shared argTypes definitions
 */

import type {
    OnApproveDataOneTimePayments,
    OnCancelDataOneTimePayments,
    OnCancelDataSavePayments,
    OnErrorData,
} from "@paypal/react-paypal-js/sdk-v6";
import { action } from "storybook/actions";

export const SAMPLE_INTEGRATION_API =
    import.meta.env.STORYBOOK_PAYPAL_API_URL ||
    "https://v6-web-sdk-sample-integration-server.fly.dev";

// One-Time Payment APIs

export async function createOrder(): Promise<{ orderId: string }> {
    const response = await fetch(
        `${SAMPLE_INTEGRATION_API}/paypal-api/checkout/orders/create-order-for-one-time-payment`,
        { method: "POST" },
    );
    const data = await response.json();
    return { orderId: data.id };
}

export async function captureOrder(
    orderId: string,
): Promise<Record<string, unknown>> {
    const response = await fetch(
        `${SAMPLE_INTEGRATION_API}/paypal-api/checkout/orders/${orderId}/capture`,
        { method: "POST" },
    );
    return response.json();
}

// Vault/Save Payment APIs

export async function createVaultToken(): Promise<{ vaultSetupToken: string }> {
    const response = await fetch(
        `${SAMPLE_INTEGRATION_API}/paypal-api/vault/create-setup-token-for-paypal-save-payment`,
        { method: "POST" },
    );
    const data = await response.json();
    return { vaultSetupToken: data.id };
}

// Shared Callbacks
// Note: onError is typed as 'unknown' to avoid intersection conflict between
// PayPalError and HTMLButtonElement's onError (ReactEventHandler) in the component props

export const oneTimePaymentCallbacks = {
    onApprove: async (data: OnApproveDataOneTimePayments) => {
        const orderData = await captureOrder(data.orderId);
        action("approve")({
            ...orderData,
            orderID: data.orderId,
        });
    },
    onCancel: (data: OnCancelDataOneTimePayments) => {
        action("cancel")(data);
    },
    onError: (error: unknown) => {
        action("error")(error as OnErrorData);
    },
};

export const savePaymentCallbacks = {
    onApprove: async (data: { vaultSetupToken: string }) => {
        action("approve")(data);
    },
    onCancel: (data: OnCancelDataSavePayments) => {
        action("cancel")(data);
    },
    onError: (error: unknown) => {
        action("error")(error as OnErrorData);
    },
};

// Shared ArgTypes

export const BUTTON_TYPES = [
    "pay",
    "checkout",
    "buynow",
    "subscribe",
    "donate",
] as const;

export const buttonTypeArgType = {
    control: { type: "select" as const },
    options: BUTTON_TYPES,
    description: "Button label type",
};

export const presentationModeArgType = {
    control: { type: "select" as const },
    options: ["auto", "popup", "modal", "redirect"],
    description: "How the checkout flow is presented",
};

export const venmoPresentationModeArgType = {
    control: { type: "select" as const },
    options: ["auto", "popup", "modal"],
    description: "Venmo presentation mode (auto, popup, or modal only)",
};

export const disabledArgType = {
    control: { type: "boolean" as const },
    description: "Disable the button",
};
