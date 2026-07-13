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
            "LPM",
            [
              "iDEAL",
              "Bancontact",
              "EPS",
              "BLIK",
              "MyBank",
              "Trustly",
              "Przelewy24",
              "Multibanco",
              "Bizum",
              "Swish",
              "TWINT",
              "WeChat Pay",
              "Verkkopankki",
              "PayU",
              "MB WAY",
              "Satispay",
              "Wero",
              "FLOA",
              "GrabPay",
              "Pix",
              "SEPA",
              "DOKU",
              "Estonia Banks",
              "GoPay",
              "Alipay",
              "Indonesia Banks",
              "Kredivo",
              "LinkAja",
              "OVO",
              "Paysera",
              "Skrill",
              "BLIK Pay Later",
              "Bancomat Pay",
              "Jeniuspay",
            ],
          ],
        ],
      },
    },
  },
  decorators: [withPaymentResult, withPayPalProvider],
};

export default preview;
