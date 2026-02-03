import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import type { StoryFn } from "@storybook/react";
import type { DocsContextProps } from "@storybook/addon-docs";

import { PayLaterOneTimePaymentButton } from "../../../v6";
import {
    createOrder,
    oneTimePaymentCallbacks,
    presentationModeArgType,
    disabledArgType,
} from "../shared/utils";
import V6DocPageStructure from "../../components/V6DocPageStructure";
import { getPayLaterOneTimePaymentButtonCode } from "../shared/code";

const meta: Meta<typeof PayLaterOneTimePaymentButton> = {
    title: "V6/Buttons/PayLaterOneTimePaymentButton",
    component: PayLaterOneTimePaymentButton,
    parameters: {
        controls: { expanded: true },
        docs: {
            description: {
                component: `Pay Later button for buy now, pay later checkout flows.

This button enables customers to pay over time using PayPal's Pay Later options, including Pay in 4 and Pay Monthly. It provides flexible payment options at no additional cost to merchants.

It relies on the \`<PayPalProvider />\` parent component for managing SDK initialization and state.
For more information, see [PayPal Pay Later](https://docs.paypal.ai/payments/methods/pay-later/overview)
`,
            },
        },
    },
    argTypes: {
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

type Story = StoryObj<typeof PayLaterOneTimePaymentButton>;

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
                code={getPayLaterOneTimePaymentButtonCode()}
            />
        ),
    },
};
