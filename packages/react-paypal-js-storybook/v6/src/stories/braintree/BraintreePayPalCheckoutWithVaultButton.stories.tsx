import type { Meta, StoryObj } from "@storybook/react";

import {
  BraintreePayPalCheckoutWithVaultButton,
  INSTANCE_LOADING_STATE,
  useBraintreePayPal,
} from "@paypal/react-paypal-js/sdk-v6";
import type { BraintreeApprovalData } from "@paypal/react-paypal-js/sdk-v6";

import { action } from "storybook/actions";
import { dispatchPaymentResult } from "../../shared/PaymentResult";
import {
  braintreeSharedCancelHandler,
  braintreeSharedErrorHandler,
  braintreeTransactionSaleWithVault,
} from "../../shared/braintree/utils";
import { withBraintreePayPalProvider } from "../../decorators";
import { disabledArgType } from "../../shared/utils";
import { V6DocPageStructure } from "../../components";
import { getBraintreeCheckoutWithVaultButtonCode } from "../../shared/braintree/code";

type BraintreeCheckoutWithVaultArgs = {
  amount: string;
  currency: string;
  billingAgreementDescription: string;
  disabled: boolean;
};

function BraintreeCheckoutWithVaultButtonStoryWrapper({
  amount,
  currency,
  billingAgreementDescription,
  disabled,
}: BraintreeCheckoutWithVaultArgs) {
  const { braintreePayPalCheckoutInstance: instance, loadingStatus } =
    useBraintreePayPal();

  if (loadingStatus !== INSTANCE_LOADING_STATE.RESOLVED || !instance) {
    return <div>Initializing Braintree…</div>;
  }

  return (
    <BraintreePayPalCheckoutWithVaultButton
      amount={amount}
      currency={currency}
      billingAgreementDetails={{ description: billingAgreementDescription }}
      disabled={disabled}
      onApprove={async (data: BraintreeApprovalData) => {
        const { nonce } = await instance.tokenizePayment(data);
        const result = await braintreeTransactionSaleWithVault(nonce, amount);
        action("approve")({ nonce, ...((result as object) ?? {}) });
        dispatchPaymentResult(
          "success",
          `Braintree sale captured and payment method vaulted. Nonce: ${nonce}`,
        );
      }}
      onCancel={braintreeSharedCancelHandler}
      onError={braintreeSharedErrorHandler}
    />
  );
}

const meta: Meta<BraintreeCheckoutWithVaultArgs> = {
  title: "V6/Braintree/BraintreePayPalCheckoutWithVaultButton",
  tags: ["autodocs"],
  parameters: {
    providerType: "braintree",
    controls: { expanded: true },
    docs: {
      description: {
        component:
          "Braintree PayPal checkout-with-vault button. Charges the buyer " +
          "once AND saves their payment method in the same flow — useful for " +
          "first-purchase + auto-rebill scenarios.",
      },
      page: () => (
        <V6DocPageStructure code={getBraintreeCheckoutWithVaultButtonCode()} />
      ),
    },
  },
  argTypes: {
    amount: {
      control: { type: "text" },
      description: 'Charge amount as a string (e.g. "10.00"). Required.',
    },
    currency: {
      control: { type: "text" },
      description: 'ISO 4217 currency code (e.g. "USD"). Required.',
    },
    billingAgreementDescription: {
      control: { type: "text" },
      description:
        "Human-readable description shown to the buyer when consenting to save the payment method.",
    },
    disabled: disabledArgType,
  },
  decorators: [withBraintreePayPalProvider],
};

export default meta;

type Story = StoryObj<BraintreeCheckoutWithVaultArgs>;

export const Default: Story = {
  render: (args) => <BraintreeCheckoutWithVaultButtonStoryWrapper {...args} />,
  args: {
    amount: "10.00",
    currency: "USD",
    billingAgreementDescription: "Save payment method for future purchases",
    disabled: false,
  },
};
