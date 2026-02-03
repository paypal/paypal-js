import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import type { StoryFn } from "@storybook/react";
import type { DocsContextProps } from "@storybook/addon-docs";

import { PayPalOneTimePaymentButton } from "../../../v6";
import {
    createOrder,
    oneTimePaymentCallbacks,
    buttonTypeArgType,
    presentationModeArgType,
    disabledArgType,
} from "../shared/utils";
import V6DocPageStructure from "../../components/V6DocPageStructure";
import { getPayPalOneTimePaymentButtonCode } from "../shared/code";

const meta: Meta<typeof PayPalOneTimePaymentButton> = {
    title: "V6/Buttons/PayPalOneTimePaymentButton",
    component: PayPalOneTimePaymentButton,
    parameters: {
        controls: { expanded: true },
        docs: {
            description: {
                component: `PayPal one-time payment button for standard checkout flows.

It relies on the \`<PayPalProvider />\` parent component for managing SDK initialization and state.
For more information, see [PayPal V6 Web SDK Documentation](https://docs.paypal.ai/payments/methods/paypal/sdk/js/v6/paypal-checkout)
`,
            },
        },
    },
    argTypes: {
        type: buttonTypeArgType,
        presentationMode: presentationModeArgType,
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

type Story = StoryObj<typeof PayPalOneTimePaymentButton>;

export const Default: Story = {
    args: {
        createOrder,
        presentationMode: "auto",
        ...oneTimePaymentCallbacks,
    },
};

(Default as StoryFn).parameters = {
    docs: {
        container: ({ context }: { context: DocsContextProps }) => (
            <V6DocPageStructure
                context={context}
                code={getPayPalOneTimePaymentButtonCode()}
            />
        ),
    },
};
