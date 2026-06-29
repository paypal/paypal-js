import type { Meta, StoryObj } from "@storybook/react";

import {
  BraintreePayPalPayLaterButton,
  INSTANCE_LOADING_STATE,
  useBraintreeEligibleMethods,
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
import { getBraintreePayLaterButtonCode } from "../../shared/braintree/code";

type BraintreePayLaterArgs = {
  amount: string;
  currency: string;
  countryCode: string;
  disabled: boolean;
};

function BraintreePayLaterButtonStoryWrapper({
  amount,
  currency,
  countryCode,
  disabled,
}: BraintreePayLaterArgs) {
  const { braintreePayPalCheckoutInstance: instance, loadingStatus } =
    useBraintreePayPal();
  const {
    eligiblePaymentMethods,
    isLoading: isEligibilityLoading,
    error: eligibilityError,
  } = useBraintreeEligibleMethods({
    amount,
    currency,
    countryCode: countryCode.trim() || undefined,
    paymentFlow: "ONE_TIME_PAYMENT",
  });

  if (loadingStatus !== INSTANCE_LOADING_STATE.RESOLVED || !instance) {
    return <div>Initializing Braintree…</div>;
  }

  if (isEligibilityLoading) {
    return <div>Checking Pay Later eligibility…</div>;
  }

  if (eligibilityError) {
    return (
      <div>
        Failed to check Pay Later eligibility: {eligibilityError.message}
      </div>
    );
  }

  if (!eligiblePaymentMethods?.paylater) {
    return <div>Pay Later is not eligible for this configuration.</div>;
  }

  return (
    <BraintreePayPalPayLaterButton
      amount={amount}
      currency={currency}
      disabled={disabled}
      onApprove={async (data: BraintreeApprovalData) => {
        const { nonce } = await instance.tokenizePayment(data);
        const result = await braintreeTransactionSale(nonce, amount);
        action("approve")({ nonce, ...((result as object) ?? {}) });
        dispatchPaymentResult(
          "success",
          `Braintree Pay Later sale captured. Nonce: ${nonce}`,
        );
      }}
      onCancel={braintreeSharedCancelHandler}
      onError={braintreeSharedErrorHandler}
    />
  );
}

const meta: Meta<BraintreePayLaterArgs> = {
  title: "V6/Braintree/BraintreePayPalPayLaterButton",
  tags: ["autodocs"],
  parameters: {
    providerType: "braintree",
    controls: { expanded: true },
    docs: {
      description: {
        component:
          "Braintree PayPal Pay Later button. Charges the buyer once using " +
          "Pay Later financing. This button must wait for " +
          "useBraintreeEligibleMethods to populate Pay Later eligibility " +
          "details before rendering, otherwise the underlying web component " +
          "is hidden.",
      },
      page: () => (
        <V6DocPageStructure code={getBraintreePayLaterButtonCode()} />
      ),
    },
  },
  argTypes: {
    amount: {
      control: { type: "text" },
      description:
        'Charge amount as a string (e.g. "100.00"). Used for Pay Later eligibility and payment creation.',
    },
    currency: {
      control: { type: "text" },
      description:
        'ISO 4217 currency code (e.g. "USD"). Used for Pay Later eligibility and payment creation.',
    },
    countryCode: {
      control: { type: "text" },
      description:
        'Buyer country code used for Pay Later eligibility (e.g. "US").',
    },
    disabled: disabledArgType,
  },
  decorators: [withBraintreePayPalProvider],
};

export default meta;

type Story = StoryObj<BraintreePayLaterArgs>;

export const Default: Story = {
  render: (args) => <BraintreePayLaterButtonStoryWrapper {...args} />,
  args: {
    amount: "100.00",
    currency: "USD",
    countryCode: "US",
    disabled: false,
  },
};
