import type { Preview } from "@storybook/react";
import { withPayPalProvider } from "../src/decorators";

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
                            "PayPalSavePaymentButton",
                            "PayPalGuestPaymentButton",
                        ],
                    ],
                ],
            },
        },
    },
    decorators: [withPayPalProvider],
};

export default preview;
