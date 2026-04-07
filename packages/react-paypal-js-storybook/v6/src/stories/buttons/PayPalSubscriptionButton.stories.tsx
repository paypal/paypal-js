import type { Meta, StoryObj } from "@storybook/react";

import { PayPalSubscriptionButton } from "@paypal/react-paypal-js/sdk-v6";
import {
    createSubscription,
    subscriptionCallbacks,
    buttonTypeArgType,
    presentationModeArgType,
    disabledArgType,
} from "../../shared/utils";
import { V6DocPageStructure } from "../../components";
import { getPayPalSubscriptionButtonCode } from "../../shared/code";

const meta: Meta<typeof PayPalSubscriptionButton> = {
    title: "V6/Buttons/PayPalSubscriptionButton",
    component: PayPalSubscriptionButton,
    tags: ["autodocs"],
    parameters: {
        controls: { expanded: true },
        docs: {
            description: {
                component: `PayPal Subscription button for recurring payment flows.

This button enables customers to subscribe to a billing plan for recurring payments. It handles the full subscription creation and approval flow.

It relies on the \`<PayPalProvider />\` parent component for managing SDK initialization and state.
For more information, see [PayPal Subscriptions](https://docs.paypal.ai/payments/subscriptions)
`,
            },
            page: () => (
                <V6DocPageStructure code={getPayPalSubscriptionButtonCode()} />
            ),
        },
    },
    argTypes: {
        type: buttonTypeArgType,
        presentationMode: presentationModeArgType,
        disabled: disabledArgType,
        createSubscription: {
            description:
                "Function that creates a subscription and returns the subscription ID.",
            table: { category: "Events" },
        },
        onApprove: {
            description: "Called when the buyer approves the subscription.",
            table: { category: "Events" },
        },
        onCancel: {
            description: "Called when the buyer cancels the subscription flow.",
            table: { category: "Events" },
        },
        onError: {
            description:
                "Called when an error occurs during the subscription flow.",
            table: { category: "Events" },
        },
    },
};

export default meta;

type Story = StoryObj<typeof PayPalSubscriptionButton>;

export const Default: Story = {
    args: {
        createSubscription,
        presentationMode: "auto",
        ...subscriptionCallbacks,
    },
};
