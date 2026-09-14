import type { Meta, StoryObj } from "@storybook/react";
import type { Decorator } from "@storybook/react";

import {
  IdealOneTimePaymentButton,
  useEligibleMethods,
} from "@paypal/react-paypal-js/sdk-v6";
import {
  createOrder,
  oneTimePaymentCallbacks,
  buttonTypeArgType,
  presentationModeArgType,
  disabledArgType,
} from "../../shared/utils";

/**
 * Wrapper that calls useEligibleMethods in EUR (iDEAL only supports EUR and
 * Netherlands buyers). Only renders the button if iDEAL is eligible, mirroring
 * the client-side eligibility pattern the sample integration uses for LPMs
 * (which pass currencyCode only — no paymentFlow).
 */
function IdealEligibilityWrapper({ children }: { children: React.ReactNode }) {
  const {
    eligiblePaymentMethods,
    isLoading: isEligibilityLoading,
    error: eligibilityError,
  } = useEligibleMethods({
    payload: {
      currencyCode: "EUR",
    },
  });

  const isIdealEligible =
    !isEligibilityLoading && eligiblePaymentMethods?.isEligible("ideal");

  if (isEligibilityLoading) return <div>Checking eligibility...</div>;
  if (eligibilityError)
    return <div>Failed to check eligibility: {eligibilityError.message}</div>;
  if (!isIdealEligible)
    return <div>iDEAL is not eligible for this configuration.</div>;

  return <>{children}</>;
}

const withIdealEligibility: Decorator = (Story) => (
  <IdealEligibilityWrapper>
    <Story />
  </IdealEligibilityWrapper>
);

const meta: Meta<typeof IdealOneTimePaymentButton> = {
  title: "V6/Local Payment Methods/iDEAL",
  component: IdealOneTimePaymentButton,
  decorators: [withIdealEligibility],
  parameters: {
    sdkComponents: ["ideal-payments"],
    testBuyerCountry: "NL",
  },
  argTypes: {
    type: buttonTypeArgType,
    presentationMode: presentationModeArgType,
    disabled: disabledArgType,
  },
};

export default meta;

type Story = StoryObj<typeof IdealOneTimePaymentButton>;

export const Default: Story = {
  args: {
    createOrder: () => createOrder("EUR"),
    presentationMode: "popup",
    fieldValues: { name: "Test Buyer" },
    ...oneTimePaymentCallbacks,
  },
};
