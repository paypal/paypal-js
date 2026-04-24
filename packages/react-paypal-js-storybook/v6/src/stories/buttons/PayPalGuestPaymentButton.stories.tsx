import type { Meta, StoryObj } from "@storybook/react";

import { PayPalGuestPaymentButton } from "@paypal/react-paypal-js/sdk-v6";
import {
  createOrder,
  oneTimePaymentCallbacks,
  disabledArgType,
} from "../../shared/utils";
import { V6DocPageStructure } from "../../components";
import {
  getPayPalGuestPaymentButtonCode,
  getPayPalGuestPaymentButtonEagerCode,
} from "../../shared/code";

const meta: Meta<typeof PayPalGuestPaymentButton> = {
  title: "V6/Buttons/PayPalGuestPaymentButton",
  component: PayPalGuestPaymentButton,
  tags: ["autodocs"],
  parameters: {
    controls: { expanded: true },
    docs: {
      description: {
        component: `Guest checkout button for credit/debit card payments without a PayPal account.

This button enables customers to pay with credit or debit cards without creating a PayPal account.

The button is automatically wrapped with \`<paypal-basic-card-container>\` which is required for proper functionality.

It relies on the \`<PayPalProvider />\` parent component for managing SDK initialization and state.
For more information, see [PayPal Basic Card Checkout](https://docs.paypal.ai/payments/methods/cards/standalone-payment-button)
`,
      },
      page: () => (
        <V6DocPageStructure
          code={getPayPalGuestPaymentButtonCode()}
          codeTitle="Option 1: Lazy Order Creation (Recommended)"
          additionalExamples={[
            {
              title: "Option 2: Eager Order Creation",
              code: getPayPalGuestPaymentButtonEagerCode(),
            },
          ]}
        />
      ),
    },
  },
  argTypes: {
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

type Story = StoryObj<typeof PayPalGuestPaymentButton>;

export const Default: Story = {
  args: {
    createOrder,
    ...oneTimePaymentCallbacks,
  },
};
