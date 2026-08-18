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
            "Documentation",
            [
              "Introduction",
              "Getting Started",
              "Server-Side Integration",
              "Eligibility and Hydration",
            ],
            "Buttons",
            [
              "PayPalOneTimePaymentButton",
              "PayLaterOneTimePaymentButton",
              "VenmoOneTimePaymentButton",
              "ApplePayOneTimePaymentButton",
              "GooglePayOneTimePaymentButton",
              "PayPalSavePaymentButton",
              "PayPalGuestPaymentButton",
              "PayPalSubscriptionButton",
              "PayPalCreditSavePaymentButton",
            ],
            "Card Fields",
            ["CardFieldsOneTimePayment"],
            "Braintree",
            [
              "BraintreePayPalOneTimePaymentButton",
              "BraintreePayPalPayLaterButton",
              "BraintreePayPalBillingAgreementButton",
              "BraintreePayPalCheckoutWithVaultButton",
            ],
          ],
        ],
      },
    },
  },
  decorators: [withPaymentResult, withPayPalProvider],
};

export default preview;
