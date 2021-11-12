export const parameters = {
    actions: { argTypesRegex: "^on[A-Z].*" },
    options: {
        storySort: {
            order: [
                "PayPal",
                [
                    "PayPalButtons",
                    "PayPalHostedFields",
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
