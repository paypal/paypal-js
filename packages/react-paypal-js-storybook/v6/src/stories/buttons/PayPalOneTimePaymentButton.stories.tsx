import type { Meta, StoryObj } from "@storybook/react";

import { PayPalOneTimePaymentButton } from "@paypal/react-paypal-js/sdk-v6";
import {
  createOrder,
  oneTimePaymentCallbacks,
  buttonTypeArgType,
  presentationModeArgType,
  disabledArgType,
} from "../../shared/utils";
import { V6DocPageStructure } from "../../components";
import {
  getPayPalOneTimePaymentButtonCode,
  getPayPalOneTimePaymentButtonEagerCode,
} from "../../shared/code";

const meta: Meta<typeof PayPalOneTimePaymentButton> = {
  title: "V6/Buttons/PayPalOneTimePaymentButton",
  component: PayPalOneTimePaymentButton,
  tags: ["autodocs"],
  parameters: {
    controls: { expanded: true },
    docs: {
      description: {
        component: `PayPal one-time payment button for standard checkout flows.

It relies on the \`<PayPalProvider />\` parent component for managing SDK initialization and state.
For more information, see [PayPal V6 Web SDK Documentation](https://docs.paypal.ai/payments/methods/paypal/sdk/js/v6/paypal-checkout)
`,
      },
      page: () => (
        <V6DocPageStructure
          code={getPayPalOneTimePaymentButtonCode()}
          codeTitle="Option 1: Lazy Order Creation (Recommended)"
          additionalExamples={[
            {
              title: "Option 2: Eager Order Creation",
              code: getPayPalOneTimePaymentButtonEagerCode(),
            },
          ]}
        />
      ),
    },
  },
  argTypes: {
    type: buttonTypeArgType,
    presentationMode: presentationModeArgType,
    disabled: disabledArgType,
    createOrder: {
      description:
        "Function that lazily creates an order on button click and returns `{ orderId }`. Mutually exclusive with `orderId`. (Recommended)",
      table: { category: "Events" },
    },
    orderId: {
      description:
        "Pre-created order ID string. Use when the order is created before rendering. Mutually exclusive with `createOrder`.",
      table: { category: "Events" },
    },
    onApprove: {
      description: "Called when the buyer approves the payment.",
      table: { category: "Events" },
    },
    onCancel: {
      description: "Called when the buyer cancels the payment.",
      table: { category: "Events" },
    },
    onError: {
      description: "Called when an error occurs during the payment flow.",
      table: { category: "Events" },
    },
  },
};

export default meta;

type Story = StoryObj<typeof PayPalOneTimePaymentButton>;

export const Default: Story = {
  args: {
    createOrder,
    presentationMode: "auto",
    ...oneTimePaymentCallbacks,
  },
};
