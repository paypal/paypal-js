import type { Preview } from "@storybook/react";
import { withPayPalProvider, withPaymentResult } from "../src/decorators";

const preview: Preview = {
    parameters: {
        actions: {
            // Automatically create actions for props matching on* pattern
            argTypesRegex: "^on[A-Z].*",
        },
        controls: {
            matchers: {
                color: /(background|color)$/i,
                date: /Date$/i,
            },
        },
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
                            "ApplePayOneTimePaymentButton",
                            "PayPalSavePaymentButton",
                            "PayPalGuestPaymentButton",
                            "PayPalSubscriptionButton",
                            "PayPalCreditSavePaymentButton",
                        ],
                        "Card Fields",
                        ["CardFieldsOneTimePayment"],
                    ],
                ],
            },
        },
    },
    decorators: [withPaymentResult, withPayPalProvider],
};

export default preview;
