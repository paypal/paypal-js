import type { Meta, StoryObj } from "@storybook/react";

import {
  BraintreePayPalOneTimePaymentButton,
  INSTANCE_LOADING_STATE,
  useBraintreePayPal,
} from "@paypal/react-paypal-js/sdk-v6";
import type { BraintreeApprovalData } from "@paypal/react-paypal-js/sdk-v6";

import { action } from "storybook/actions";
import { dispatchPaymentResult } from "../../shared/PaymentResult";
import {
  braintreeSharedCancelHandler,
  braintreeSharedErrorHandler,
  braintreeTransactionSale,
} from "../../shared/braintree/utils";
import { withBraintreePayPalProvider } from "../../decorators";
import { disabledArgType } from "../../shared/utils";
import { V6DocPageStructure } from "../../components";
import { getBraintreeOneTimePaymentButtonCode } from "../../shared/braintree/code";

type BraintreeOneTimeArgs = {
  amount: string;
  currency: string;
  disabled: boolean;
};

function BraintreeOneTimeButtonStoryWrapper({
  amount,
  currency,
  disabled,
}: BraintreeOneTimeArgs) {
  const { braintreePayPalCheckoutInstance: instance, loadingStatus } =
    useBraintreePayPal();

  if (loadingStatus !== INSTANCE_LOADING_STATE.RESOLVED || !instance) {
    return <div>Initializing Braintree…</div>;
  }

  return (
    <BraintreePayPalOneTimePaymentButton
      amount={amount}
      currency={currency}
      disabled={disabled}
      onApprove={async (data: BraintreeApprovalData) => {
        const { nonce } = await instance.tokenizePayment(data);
        const result = await braintreeTransactionSale(nonce, amount);
        action("approve")({ nonce, ...((result as object) ?? {}) });
        dispatchPaymentResult(
          "success",
          `Braintree sale captured. Nonce: ${nonce}`,
        );
      }}
      onCancel={braintreeSharedCancelHandler}
      onError={braintreeSharedErrorHandler}
    />
  );
}

const meta: Meta<BraintreeOneTimeArgs> = {
  title: "V6/Braintree/BraintreePayPalOneTimePaymentButton",
  tags: ["autodocs"],
  parameters: {
    providerType: "braintree",
    controls: { expanded: true },
    docs: {
      description: {
        component:
          "Braintree PayPal one-time payment button. Charges the buyer once " +
          "and does not save the payment method. Must be rendered inside a " +
          "BraintreePayPalProvider — the storybook decorator handles this.",
      },
      page: () => (
        <V6DocPageStructure code={getBraintreeOneTimePaymentButtonCode()} />
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
    disabled: disabledArgType,
  },
  decorators: [withBraintreePayPalProvider],
};

export default meta;

type Story = StoryObj<BraintreeOneTimeArgs>;

export const Default: Story = {
  render: (args) => <BraintreeOneTimeButtonStoryWrapper {...args} />,
  args: {
    amount: "10.00",
    currency: "USD",
    disabled: false,
  },
};
