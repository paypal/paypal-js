import type { Meta, StoryObj } from "@storybook/react";

import { VenmoSavePaymentButton } from "@paypal/react-paypal-js/sdk-v6";
import {
  createVenmoVaultToken,
  savePaymentCallbacks,
  buttonTypeArgType,
  venmoPresentationModeArgType,
  disabledArgType,
} from "../../shared/utils";
import { V6DocPageStructure } from "../../components";
import {
  getVenmoSavePaymentButtonCode,
  getVenmoSavePaymentButtonEagerCode,
} from "../../shared/code";

const meta: Meta<typeof VenmoSavePaymentButton> = {
  title: "V6/Buttons/VenmoSavePaymentButton",
  component: VenmoSavePaymentButton,
  tags: ["autodocs"],
  parameters: {
    controls: { expanded: true },
    docs: {
      description: {
        component: `Venmo Save Payment button for vault/save payment method flows (VAULT_WITHOUT_PAYMENT).

This button enables customers to save their Venmo account for future use without making an immediate payment. For a flow that vaults the Venmo account while also completing an order (VAULT_WITH_PAYMENT), pass \`savePayment\` to \`VenmoOneTimePaymentButton\` instead.

It relies on the \`<PayPalProvider />\` parent component for managing SDK initialization and state.
For more information, see [Pay with Venmo](https://docs.paypal.ai/payments/methods/venmo/integrate)
`,
      },
      page: () => (
        <V6DocPageStructure
          code={getVenmoSavePaymentButtonCode()}
          codeTitle="Option 1: Lazy Vault Token Creation (Recommended)"
          additionalExamples={[
            {
              title: "Option 2: Eager Vault Token Creation",
              code: getVenmoSavePaymentButtonEagerCode(),
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
    createVaultToken: {
      description:
        "Function that lazily creates a vault setup token on button click and returns `{ vaultSetupToken }`. Mutually exclusive with `vaultSetupToken`. (Recommended)",
      table: { category: "Events" },
    },
    vaultSetupToken: {
      description:
        "Pre-created vault setup token string. Use when the token is created before rendering. Mutually exclusive with `createVaultToken`.",
      table: { category: "Events" },
    },
    onApprove: {
      description: "Called when the buyer approves saving their Venmo account.",
      table: { category: "Events" },
    },
    onCancel: {
      description: "Called when the buyer cancels the save payment flow.",
      table: { category: "Events" },
    },
    onError: {
      description: "Called when an error occurs during the save payment flow.",
      table: { category: "Events" },
    },
  },
};

export default meta;

type Story = StoryObj<typeof VenmoSavePaymentButton>;

export const Default: Story = {
  args: {
    createVaultToken: createVenmoVaultToken,
    presentationMode: "auto",
    ...savePaymentCallbacks,
  },
};
