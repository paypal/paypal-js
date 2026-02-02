import React from "react";
import { withPayPalProvider } from "../src/stories/v6/decorators";

export const parameters = {
    actions: { argTypesRegex: "^on[A-Z].*" },
    options: {
        storySort: {
            order: [
                "V6",
                [
                    "Buttons",
                    [
                        "PayPalOneTimePaymentButton",
                        "PayLaterOneTimePaymentButton",
                        "VenmoOneTimePaymentButton",
                        "PayPalSavePaymentButton",
                        "PayPalGuestPaymentButton",
                    ],
                ],
                "PayPal",
                [
                    "PayPalButtons",
                    "PayPalCardFields",
                    "PayPalHostedFields",
                    "PayPalHostedFieldsProvider",
                    "PayPalMarks",
                    "PayPalMessages",
                    "Subscriptions",
                    "VenmoButton",
                    "PayPalScriptProvider",
                ],
                "Braintree",
            ],
        },
    },
};

// Global decorator: Apply PayPalProvider only to V6 stories
export const decorators = [
    (Story, context) => {
        // Only apply to V6 stories (check the story title)
        if (context.title.startsWith("V6/")) {
            return withPayPalProvider(Story);
        }
        return <Story />;
    },
];
