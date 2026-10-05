import type { Meta, StoryObj } from "@storybook/react";

import { VenmoOneTimePaymentButton } from "@paypal/react-paypal-js/sdk-v6";
import {
  createOrder,
  oneTimePaymentCallbacks,
  buttonTypeArgType,
  venmoPresentationModeArgType,
  disabledArgType,
} from "../../shared/utils";
import { V6DocPageStructure } from "../../components";
import {
  getVenmoOneTimePaymentButtonCode,
  getVenmoOneTimePaymentButtonEagerCode,
  getVenmoOneTimePaymentButtonVaultWithPaymentCode,
} from "../../shared/code";

const meta: Meta<typeof VenmoOneTimePaymentButton> = {
  title: "V6/Buttons/VenmoOneTimePaymentButton",
  component: VenmoOneTimePaymentButton,
  tags: ["autodocs"],
  parameters: {
    controls: { expanded: true },
    docs: {
      description: {
        component: `Pay with Venmo offers a simplified mobile checkout experience at no additional cost.

Pass \`savePayment\` to also vault the buyer's Venmo account while completing this order (VAULT_WITH_PAYMENT). For a vault-only flow with no purchase, use \`VenmoSavePaymentButton\` instead.

It relies on the \`<PayPalProvider />\` parent component for managing SDK initialization and state.
For more information, see [Pay with Venmo](https://docs.paypal.ai/payments/methods/venmo/integrate)
`,
      },
      page: () => (
        <V6DocPageStructure
          code={getVenmoOneTimePaymentButtonCode()}
          codeTitle="Option 1: Lazy Order Creation (Recommended)"
          additionalExamples={[
            {
              title: "Option 2: Eager Order Creation",
              code: getVenmoOneTimePaymentButtonEagerCode(),
            },
            {
              title: "Option 3: Vault With Purchase (savePayment)",
              code: getVenmoOneTimePaymentButtonVaultWithPaymentCode(),
            },
          ]}
        />
      ),
    },
  },
  argTypes: {
    type: buttonTypeArgType,
    presentationMode: venmoPresentationModeArgType,
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
    savePayment: {
      description:
        "Vault the buyer's Venmo account while also completing this order (VAULT_WITH_PAYMENT). For a vault-only flow with no purchase, use `VenmoSavePaymentButton` instead.",
      control: { type: "boolean" as const },
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

type Story = StoryObj<typeof VenmoOneTimePaymentButton>;

export const Default: Story = {
  args: {
    createOrder,
    presentationMode: "auto",
    ...oneTimePaymentCallbacks,
  },
};

export const VaultWithPayment: Story = {
  args: {
    createOrder,
    savePayment: true,
    presentationMode: "auto",
    ...oneTimePaymentCallbacks,
  },
};
