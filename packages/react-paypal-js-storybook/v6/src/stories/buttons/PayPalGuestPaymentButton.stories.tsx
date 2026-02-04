import React from "react";
import type { Meta, StoryObj } from "@storybook/react";

import { PayPalGuestPaymentButton } from "@paypal/react-paypal-js/sdk-v6";
import {
    createOrder,
    oneTimePaymentCallbacks,
    disabledArgType,
} from "../../shared/utils";
import { V6DocPageStructure } from "../../components";
import { getPayPalGuestPaymentButtonCode } from "../../shared/code";

const GuestPaymentButtonWithContainer = (
    props: React.ComponentProps<typeof PayPalGuestPaymentButton>,
) => (
    <paypal-basic-card-container>
        <PayPalGuestPaymentButton {...props} />
    </paypal-basic-card-container>
);

const meta: Meta<typeof PayPalGuestPaymentButton> = {
    title: "V6/Buttons/PayPalGuestPaymentButton",
    component: GuestPaymentButtonWithContainer,
    tags: ["autodocs"],
    parameters: {
        controls: { expanded: true },
        docs: {
            description: {
                component: `Guest checkout button for credit/debit card payments without a PayPal account.

This button enables customers to pay with credit or debit cards without creating a PayPal account.

It relies on the \`<PayPalProvider />\` parent component for managing SDK initialization and state.
For more information, see [PayPal Basic Card Checkout](https://docs.paypal.ai/payments/methods/cards/standalone-payment-button)
`,
            },
            page: () => (
                <V6DocPageStructure code={getPayPalGuestPaymentButtonCode()} />
            ),
        },
    },
    argTypes: {
        disabled: disabledArgType,
        createOrder: {
            description:
                "Function that creates an order and returns the order ID.",
            table: { category: "Events" },
        },
        onApprove: {
            description: "Called when the buyer approves the payment.",
            table: { category: "Events" },
        },
        onCancel: {
            description: "Called when the buyer cancels the payment.",
            table: { category: "Events" },
        },
        onError: {
            description: "Called when an error occurs during the payment flow.",
            table: { category: "Events" },
        },
    },
};

export default meta;

type Story = StoryObj<typeof PayPalGuestPaymentButton>;

export const Default: Story = {
    args: {
        createOrder,
        ...oneTimePaymentCallbacks,
    },
};
