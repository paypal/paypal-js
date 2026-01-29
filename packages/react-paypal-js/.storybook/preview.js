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
