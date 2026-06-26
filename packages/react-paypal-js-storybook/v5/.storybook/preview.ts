import type { Preview } from "@storybook/react";

const preview: Preview = {
  parameters: {
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
  },
  tags: ["autodocs"],
};

export default preview;
