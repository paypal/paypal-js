import React from "react";
import type { Meta, StoryObj } from "@storybook/react";

import { withPayPalProvider } from "../decorators";
import { PayLaterOneTimePaymentButton } from "../../../v6";
import type {
    OnApproveDataOneTimePayments,
    OnCancelDataOneTimePayments,
    OnErrorData,
} from "../../../v6";

const SAMPLE_INTEGRATION_API =
    process.env.STORYBOOK_PAYPAL_API_URL ||
    "https://v6-web-sdk-sample-integration-server.fly.dev";

async function createOrder(): Promise<{ orderId: string }> {
    const response = await fetch(
        `${SAMPLE_INTEGRATION_API}/paypal-api/checkout/orders/create-order-for-one-time-payment`,
        { method: "POST" },
    );
    const data = await response.json();
    return { orderId: data.id };
}

async function captureOrder(orderId: string): Promise<void> {
    await fetch(
        `${SAMPLE_INTEGRATION_API}/paypal-api/checkout/orders/${orderId}/capture`,
        { method: "POST" },
    );
}

const meta: Meta<typeof PayLaterOneTimePaymentButton> = {
    title: "V6/Buttons/PayLaterOneTimePaymentButton",
    component: PayLaterOneTimePaymentButton,
    decorators: [withPayPalProvider],
};

export default meta;

type Story = StoryObj<typeof PayLaterOneTimePaymentButton>;

export const Default: Story = {
    args: {
        createOrder,
        presentationMode: "auto",
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
    },
};

export const Disabled: Story = {
    args: {
        ...Default.args,
        disabled: true,
    },
};

export const PopupWithOverlay: Story = {
    name: "Popup with Overlay",
    args: {
        ...Default.args,
        presentationMode: "popup",
    },
};

export const PopupWithoutOverlay: Story = {
    name: "Popup without Overlay",
    args: {
        ...Default.args,
        presentationMode: "popup",
        fullPageOverlay: {
            enabled: false,
        },
    },
};
