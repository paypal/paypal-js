import type { Meta, StoryObj } from "@storybook/react";

import {
  BraintreePayPalBillingAgreementButton,
  INSTANCE_LOADING_STATE,
  useBraintreePayPal,
} from "@paypal/react-paypal-js/sdk-v6";
import type { BraintreeApprovalData } from "@paypal/react-paypal-js/sdk-v6";

import { action } from "storybook/actions";
import { dispatchPaymentResult } from "../../shared/PaymentResult";
import {
  braintreeSharedCancelHandler,
  braintreeSharedErrorHandler,
  braintreeVaultPaymentMethod,
} from "../../shared/braintree/utils";
import { withBraintreePayPalProvider } from "../../decorators";
import { disabledArgType } from "../../shared/utils";
import { V6DocPageStructure } from "../../components";
import { getBraintreeBillingAgreementButtonCode } from "../../shared/braintree/code";

type BraintreeBillingAgreementArgs = {
  billingAgreementDescription: string;
  disabled: boolean;
};

function BraintreeBillingAgreementButtonStoryWrapper({
  billingAgreementDescription,
  disabled,
}: BraintreeBillingAgreementArgs) {
  const { braintreePayPalCheckoutInstance: instance, loadingStatus } =
    useBraintreePayPal();

  if (loadingStatus !== INSTANCE_LOADING_STATE.RESOLVED || !instance) {
    return <div>Initializing Braintree…</div>;
  }

  return (
    <BraintreePayPalBillingAgreementButton
      billingAgreementDescription={billingAgreementDescription}
      disabled={disabled}
      onApprove={async (data: BraintreeApprovalData) => {
        const { nonce } = await instance.tokenizePayment(data);
        const result = await braintreeVaultPaymentMethod(nonce);
        action("approve")({ nonce, ...((result as object) ?? {}) });
        dispatchPaymentResult(
          "success",
          `Braintree payment method vaulted. Nonce: ${nonce}`,
        );
      }}
      onCancel={braintreeSharedCancelHandler}
      onError={braintreeSharedErrorHandler}
    />
  );
}

const meta: Meta<BraintreeBillingAgreementArgs> = {
  title: "V6/Braintree/BraintreePayPalBillingAgreementButton",
  tags: ["autodocs"],
  parameters: {
    providerType: "braintree",
    controls: { expanded: true },
    docs: {
      description: {
        component:
          "Braintree PayPal billing agreement button. Saves the buyer's " +
          "PayPal account for future use (vault flow); does not charge them. " +
          "Use for subscriptions, recurring payments, and one-click checkout " +
          "setup.",
      },
      page: () => (
        <V6DocPageStructure code={getBraintreeBillingAgreementButtonCode()} />
      ),
    },
  },
  argTypes: {
    billingAgreementDescription: {
      control: { type: "text" },
      description:
        "Human-readable description shown to the buyer in the PayPal consent flow.",
    },
    disabled: disabledArgType,
  },
  decorators: [withBraintreePayPalProvider],
};

export default meta;

type Story = StoryObj<BraintreeBillingAgreementArgs>;

export const Default: Story = {
  render: (args) => <BraintreeBillingAgreementButtonStoryWrapper {...args} />,
  args: {
    billingAgreementDescription: "Save PayPal account for future payments",
    disabled: false,
  },
};
