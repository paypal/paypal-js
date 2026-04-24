import type { Meta, StoryObj } from "@storybook/react";
import type { Decorator } from "@storybook/react";

import {
  PayPalCreditSavePaymentButton,
  useEligibleMethods,
} from "@paypal/react-paypal-js/sdk-v6";
import {
  createVaultToken,
  savePaymentCallbacks,
  presentationModeArgType,
  disabledArgType,
} from "../../shared/utils";
import { V6DocPageStructure } from "../../components";
import {
  getPayPalCreditSavePaymentButtonCode,
  getPayPalCreditSavePaymentButtonEagerCode,
} from "../../shared/code";

/**
 * Wrapper that calls useEligibleMethods with the VAULT_WITHOUT_PAYMENT flow,
 * which is required for PayPal Credit eligibility.
 * Only renders children if PayPal Credit is eligible.
 */
function CreditSaveEligibilityWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const {
    eligiblePaymentMethods,
    isLoading: isEligibilityLoading,
    error: eligibilityError,
  } = useEligibleMethods({
    payload: {
      currencyCode: "USD",
      paymentFlow: "VAULT_WITHOUT_PAYMENT",
    },
  });

  const isCreditEligible =
    !isEligibilityLoading && eligiblePaymentMethods?.isEligible("credit");

  if (isEligibilityLoading) return <div>Checking eligibility...</div>;
  if (eligibilityError)
    return <div>Failed to check eligibility: {eligibilityError.message}</div>;
  if (!isCreditEligible)
    return <div>PayPal Credit is not eligible for this configuration.</div>;

  return <>{children}</>;
}

const withCreditSaveEligibility: Decorator = (Story) => (
  <CreditSaveEligibilityWrapper>
    <Story />
  </CreditSaveEligibilityWrapper>
);

const meta: Meta<typeof PayPalCreditSavePaymentButton> = {
  title: "V6/Buttons/PayPalCreditSavePaymentButton",
  component: PayPalCreditSavePaymentButton,
  tags: ["autodocs"],
  decorators: [withCreditSaveEligibility],
  parameters: {
    controls: { expanded: true },
    docs: {
      description: {
        component: `PayPal Credit Save Payment button for saving credit payment methods.

This button enables customers to save their PayPal Credit payment method for future use. The \`countryCode\` is automatically populated from the eligibility API response.

It relies on the \`<PayPalProvider />\` parent component for managing SDK initialization and state, and requires eligibility to be configured using the \`useEligibleMethods\` hook with \`paymentFlow: "VAULT_WITHOUT_PAYMENT"\`.
`,
      },
      page: () => (
        <V6DocPageStructure
          code={getPayPalCreditSavePaymentButtonCode()}
          codeTitle="Option 1: Lazy Vault Token Creation (Recommended)"
          additionalExamples={[
            {
              title: "Option 2: Eager Vault Token Creation",
              code: getPayPalCreditSavePaymentButtonEagerCode(),
            },
          ]}
        />
      ),
    },
  },
  argTypes: {
    presentationMode: presentationModeArgType,
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
      description:
        "Called when the buyer approves saving their payment method.",
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

type Story = StoryObj<typeof PayPalCreditSavePaymentButton>;

export const Default: Story = {
  args: {
    createVaultToken,
    presentationMode: "auto",
    ...savePaymentCallbacks,
  },
};
