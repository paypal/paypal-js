import React from "react";
import type { Meta, StoryObj } from "@storybook/react";

import { withPayPalProvider } from "../decorators";
import { PayPalOneTimePaymentButton } from "../../../v6";
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

const meta: Meta<typeof PayPalOneTimePaymentButton> = {
    title: "V6/Buttons/PayPalOneTimePaymentButton",
    component: PayPalOneTimePaymentButton,
    decorators: [withPayPalProvider],
};

export default meta;

type Story = StoryObj<typeof PayPalOneTimePaymentButton>;

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

export const Donate: Story = {
    args: {
        ...Default.args,
        type: "donate",
    },
};

export const Checkout: Story = {
    args: {
        ...Default.args,
        type: "checkout",
    },
};

export const BuyNow: Story = {
    args: {
        ...Default.args,
        type: "buynow",
    },
};

export const Subscribe: Story = {
    args: {
        ...Default.args,
        type: "subscribe",
    },
};
