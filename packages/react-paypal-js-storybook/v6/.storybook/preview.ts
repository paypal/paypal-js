import type { Preview } from "@storybook/react";
import { withPayPalProvider } from "../src/decorators";

const preview: Preview = {
    parameters: {
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
