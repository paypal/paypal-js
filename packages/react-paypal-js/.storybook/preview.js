export const parameters = {
    actions: { argTypesRegex: "^on[A-Z].*" },
    options: {
        storySort: {
            order: [
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
