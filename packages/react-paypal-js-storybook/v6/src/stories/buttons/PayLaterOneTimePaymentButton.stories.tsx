import type { Meta, StoryObj } from "@storybook/react";
import type { Decorator } from "@storybook/react";

import {
    PayLaterOneTimePaymentButton,
    useEligibleMethods,
} from "@paypal/react-paypal-js/sdk-v6";
import {
    createOrder,
    oneTimePaymentCallbacks,
    presentationModeArgType,
    disabledArgType,
} from "../../shared/utils";
import { V6DocPageStructure } from "../../components";
import {
    getPayLaterOneTimePaymentButtonCode,
    getPayLaterOneTimePaymentButtonEagerCode,
} from "../../shared/code";

/**
 * Wrapper that calls useEligibleMethods with the ONE_TIME_PAYMENT flow,
 * which is required for Pay Later eligibility (countryCode and productCode).
 * Only renders children if Pay Later is eligible.
 */
function PayLaterEligibilityWrapper({
    children,
}: {
    children: React.ReactNode;
}) {
    const {
        eligiblePaymentMethods,
        isLoading: isEligibilityLoading,
        error: eligibilityError,
    } = useEligibleMethods({
        payload: {
            currencyCode: "USD",
            paymentFlow: "ONE_TIME_PAYMENT",
        },
    });

    const isPayLaterEligible =
        !isEligibilityLoading && eligiblePaymentMethods?.isEligible("paylater");

    if (isEligibilityLoading) return <div>Checking eligibility...</div>;
    if (eligibilityError)
        return (
            <div>Failed to check eligibility: {eligibilityError.message}</div>
        );
    if (!isPayLaterEligible)
        return <div>Pay Later is not eligible for this configuration.</div>;

    return <>{children}</>;
}

const withPayLaterEligibility: Decorator = (Story) => (
    <PayLaterEligibilityWrapper>
        <Story />
    </PayLaterEligibilityWrapper>
);

const meta: Meta<typeof PayLaterOneTimePaymentButton> = {
    title: "V6/Buttons/PayLaterOneTimePaymentButton",
    component: PayLaterOneTimePaymentButton,
    tags: ["autodocs"],
    decorators: [withPayLaterEligibility],
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
            page: () => (
                <V6DocPageStructure
                    code={getPayLaterOneTimePaymentButtonCode()}
                    codeTitle="Option 1: Lazy Order Creation (Recommended)"
                    additionalExamples={[
                        {
                            title: "Option 2: Eager Order Creation",
                            code: getPayLaterOneTimePaymentButtonEagerCode(),
                        },
                    ]}
                />
            ),
        },
    },
    argTypes: {
        presentationMode: presentationModeArgType,
        disabled: disabledArgType,
        createOrder: {
            description:
                "Function that lazily creates an order on button click and returns `{ orderId }`. Mutually exclusive with `orderId`. (Recommended)",
            table: { category: "Events" },
        },
        orderId: {
            description:
                "Pre-created order ID string. Use when the order is created before rendering. Mutually exclusive with `createOrder`.",
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
