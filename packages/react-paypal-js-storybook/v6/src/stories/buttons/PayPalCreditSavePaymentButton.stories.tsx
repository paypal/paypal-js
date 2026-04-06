import type { Meta, StoryObj } from "@storybook/react";
import type { Decorator } from "@storybook/react";

import {
    PayPalCreditSavePaymentButton,
    useEligibleMethods,
} from "@paypal/react-paypal-js/sdk-v6";
import {
    createVaultToken,
    savePaymentCallbacks,
    presentationModeArgType,
    disabledArgType,
} from "../../shared/utils";
import { V6DocPageStructure } from "../../components";
import { getPayPalCreditSavePaymentButtonCode } from "../../shared/code";

/**
 * Wrapper that calls useEligibleMethods with the VAULT_WITHOUT_PAYMENT flow,
 * which is required for PayPal Credit eligibility.
 */
function CreditSaveEligibilityWrapper({
    children,
}: {
    children: React.ReactNode;
}) {
    useEligibleMethods({
        payload: {
            currencyCode: "USD",
            paymentFlow: "VAULT_WITHOUT_PAYMENT",
        },
    });

    return <>{children}</>;
}

const withCreditSaveEligibility: Decorator = (Story) => (
    <CreditSaveEligibilityWrapper>
        <Story />
    </CreditSaveEligibilityWrapper>
);

const meta: Meta<typeof PayPalCreditSavePaymentButton> = {
    title: "V6/Buttons/PayPalCreditSavePaymentButton",
    component: PayPalCreditSavePaymentButton,
    tags: ["autodocs"],
    decorators: [withCreditSaveEligibility],
    parameters: {
        controls: { expanded: true },
        docs: {
            description: {
                component: `PayPal Credit Save Payment button for saving credit payment methods.

This button enables customers to save their PayPal Credit payment method for future use. The \`countryCode\` is automatically populated from the eligibility API response.

It relies on the \`<PayPalProvider />\` parent component for managing SDK initialization and state, and requires eligibility to be configured using the \`useEligibleMethods\` hook with \`paymentFlow: "VAULT_WITHOUT_PAYMENT"\`.
`,
            },
            page: () => (
                <V6DocPageStructure
                    code={getPayPalCreditSavePaymentButtonCode()}
                />
            ),
        },
    },
    argTypes: {
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

type Story = StoryObj<typeof PayPalCreditSavePaymentButton>;

export const Default: Story = {
    args: {
        createVaultToken,
        presentationMode: "auto",
        ...savePaymentCallbacks,
    },
};
