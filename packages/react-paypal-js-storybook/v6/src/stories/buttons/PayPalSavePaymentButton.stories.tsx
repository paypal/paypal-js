import type { Meta, StoryObj } from "@storybook/react";

import { PayPalSavePaymentButton } from "@paypal/react-paypal-js/sdk-v6";
import {
    createVaultToken,
    savePaymentCallbacks,
    buttonTypeArgType,
    presentationModeArgType,
    disabledArgType,
} from "../../shared/utils";
import { V6DocPageStructure } from "../../components";
import { getPayPalSavePaymentButtonCode } from "../../shared/code";

const meta: Meta<typeof PayPalSavePaymentButton> = {
    title: "V6/Buttons/PayPalSavePaymentButton",
    component: PayPalSavePaymentButton,
    tags: ["autodocs"],
    parameters: {
        controls: { expanded: true },
        docs: {
            description: {
                component: `PayPal Save Payment button for vault/save payment method flows.

This button enables customers to save their PayPal payment method for future use without making an immediate payment. This is ideal for subscription services, recurring payments, or one-click checkout experiences.

It relies on the \`<PayPalProvider />\` parent component for managing SDK initialization and state.
For more information, see [PayPal Vaulting](https://docs.paypal.ai/payments/save/sdk/paypal/js-sdk-v6-vault)
`,
            },
            page: () => (
                <V6DocPageStructure code={getPayPalSavePaymentButtonCode()} />
            ),
        },
    },
    argTypes: {
        type: buttonTypeArgType,
        presentationMode: presentationModeArgType,
        disabled: disabledArgType,
        createVaultToken: {
            description:
                "Function that creates a vault setup token and returns the token ID.",
            table: { category: "Events" },
        },
        onApprove: {
            description:
                "Called when the buyer approves saving their payment method.",
            table: { category: "Events" },
        },
        onCancel: {
            description: "Called when the buyer cancels the save payment flow.",
            table: { category: "Events" },
        },
        onError: {
            description:
                "Called when an error occurs during the save payment flow.",
            table: { category: "Events" },
        },
    },
};

export default meta;

type Story = StoryObj<typeof PayPalSavePaymentButton>;

export const Default: Story = {
    args: {
        createVaultToken,
        presentationMode: "auto",
        ...savePaymentCallbacks,
    },
};
