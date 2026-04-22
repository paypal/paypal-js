import { useEffect } from "react";
import type { Meta, StoryObj } from "@storybook/react";

import {
    PayPalCardFieldsProvider,
    PayPalCardNumberField,
    PayPalCardExpiryField,
    PayPalCardCvvField,
    usePayPalCardFields,
    usePayPalCardFieldsOneTimePaymentSession,
    useEligibleMethods,
} from "@paypal/react-paypal-js/sdk-v6";
import { action } from "storybook/actions";
import { createOrder, captureOrder } from "../../shared/utils";
import { dispatchPaymentResult } from "../../shared/PaymentResult";
import { V6DocPageStructure } from "../../components";
import {
    getCardFieldsOneTimePaymentCode,
    getCardFieldsSavePaymentCode,
} from "../../shared/code";

function CardFields() {
    const { error: cardFieldsError } = usePayPalCardFields();
    const {
        error: submitError,
        submit,
        submitResponse,
    } = usePayPalCardFieldsOneTimePaymentSession();

    useEffect(() => {
        if (!submitResponse) return;

        const { orderId, message } = submitResponse.data;

        switch (submitResponse.state) {
            case "succeeded":
                action("submit")(`Payment succeeded: orderId: ${orderId}`);
                dispatchPaymentResult(
                    "success",
                    "Payment authorized, capturing...",
                );
                captureOrder(orderId)
                    .then((result) => {
                        action("approve")({
                            ...result,
                            orderID: orderId,
                        });
                        dispatchPaymentResult(
                            "success",
                            `Card payment captured successfully. Order ID: ${orderId}`,
                        );
                    })
                    .catch((error) => {
                        action("error")({
                            source: "capture",
                            error,
                        });
                        dispatchPaymentResult(
                            "error",
                            `Capture failed: ${error.message || "Unknown error"}`,
                        );
                    });
                break;
            case "failed":
                action("error")(`Payment failed: ${message}`);
                dispatchPaymentResult(
                    "error",
                    `Card payment failed: ${message}`,
                );
                break;
        }
    }, [submitResponse]);

    useEffect(() => {
        if (cardFieldsError) {
            action("error")({
                source: "cardFields",
                error: cardFieldsError,
            });
            dispatchPaymentResult(
                "error",
                `Card field error: ${cardFieldsError.message || "Unknown error"}`,
            );
        }
    }, [cardFieldsError]);

    useEffect(() => {
        if (submitError) {
            action("error")({
                source: "submit",
                error: submitError,
            });
            dispatchPaymentResult(
                "error",
                `Card submission error: ${submitError.message || "Unknown error"}`,
            );
        }
    }, [submitError]);

    const handleSubmit = async () => {
        const { orderId } = await createOrder();
        await submit(orderId);
    };

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
                maxWidth: "400px",
            }}
        >
            <PayPalCardNumberField
                containerStyles={{ height: "3rem" }}
                placeholder="Enter card number"
            />
            <PayPalCardExpiryField
                containerStyles={{ height: "3rem" }}
                placeholder="MM/YY"
            />
            <PayPalCardCvvField
                containerStyles={{ height: "3rem" }}
                placeholder="Enter CVV"
            />
            {!cardFieldsError && (
                <button className="btn btn-primary" onClick={handleSubmit}>
                    Pay
                </button>
            )}
        </div>
    );
}

function CardFieldsStory() {
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

    const isCardFieldsEligible =
        !isEligibilityLoading &&
        eligiblePaymentMethods?.isEligible("advanced_cards");

    if (isEligibilityLoading) return <div>Checking eligibility...</div>;
    if (eligibilityError)
        return (
            <div>Failed to check eligibility: {eligibilityError.message}</div>
        );
    if (!isCardFieldsEligible)
        return <div>Card Fields are not eligible for this configuration.</div>;

    return (
        <PayPalCardFieldsProvider>
            <CardFields />
        </PayPalCardFieldsProvider>
    );
}

const meta: Meta = {
    title: "V6/Card Fields/CardFieldsOneTimePayment",
    component: CardFieldsStory,
    tags: ["autodocs"],
    parameters: {
        controls: { expanded: true },
        docs: {
            description: {
                component: `Card Fields for one-time payment flows.

This example demonstrates the complete Card Fields integration using \`PayPalCardFieldsProvider\`, \`PayPalCardNumberField\`, \`PayPalCardExpiryField\`, and \`PayPalCardCvvField\` components.

The Card Fields components render secure, PCI-compliant input fields for collecting card payment details. They must be wrapped in a \`<PayPalCardFieldsProvider>\` which manages the card fields session.

It relies on the \`<PayPalProvider />\` parent component for managing SDK initialization and state.
`,
            },
            page: () => (
                <V6DocPageStructure
                    code={getCardFieldsOneTimePaymentCode()}
                    codeTitle="Option 1: One-Time Payment (Recommended)"
                    additionalExamples={[
                        {
                            title: "Option 2: Save Payment Method (Vaulting)",
                            code: getCardFieldsSavePaymentCode(),
                        },
                    ]}
                />
            ),
        },
    },
};

export default meta;

type Story = StoryObj;

export const Default: Story = {};
