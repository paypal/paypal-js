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

export async function captureOrder(orderId: string): Promise<void> {
    await fetch(
        `${SAMPLE_INTEGRATION_API}/paypal-api/checkout/orders/${orderId}/capture`,
        { method: "POST" },
    );
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

export const oneTimePaymentCallbacks = {
    onApprove: async (data: OnApproveDataOneTimePayments) => {
        console.log("Payment approved:", data);
        await captureOrder(data.orderId);
        console.log("Order captured successfully");
    },
    onCancel: (data: OnCancelDataOneTimePayments) => {
        console.log("Payment cancelled:", data);
    },
    onError: (error: OnErrorData) => {
        console.error("Payment error:", error);
    },
};

export const savePaymentCallbacks = {
    onApprove: async (data: { vaultSetupToken: string }) => {
        console.log("Payment method saved:", data);
    },
    onCancel: (data: OnCancelDataSavePayments) => {
        console.log("Save payment cancelled:", data);
    },
    onError: (error: OnErrorData) => {
        console.error("Save payment error:", error);
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
    control: "select",
    options: BUTTON_TYPES,
    description: "Button label type",
};

export const presentationModeArgType = {
    control: "select",
    options: ["auto", "popup", "modal", "redirect"],
    description: "How the checkout flow is presented",
};

export const venmoPresentationModeArgType = {
    control: "select",
    options: ["auto", "popup", "modal"],
    description: "Venmo presentation mode (auto, popup, or modal only)",
};

export const disabledArgType = {
    control: "boolean",
    description: "Disable the button",
};
