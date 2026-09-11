import type { Meta, StoryObj } from "@storybook/react";
import type { Decorator } from "@storybook/react";

import {
  BlikOneTimePaymentButton,
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
 * Wrapper that calls useEligibleMethods in PLN (BLIK only supports PLN and
 * Poland buyers). Only renders the button if BLIK is eligible, mirroring the
 * client-side eligibility pattern the sample integration uses for LPMs (which
 * pass currencyCode only — no paymentFlow).
 */
function BlikEligibilityWrapper({ children }: { children: React.ReactNode }) {
  const {
    eligiblePaymentMethods,
    isLoading: isEligibilityLoading,
    error: eligibilityError,
  } = useEligibleMethods({
    payload: {
      currencyCode: "PLN",
    },
  });

  const isBlikEligible =
    !isEligibilityLoading && eligiblePaymentMethods?.isEligible("blik");

  if (isEligibilityLoading) return <div>Checking eligibility...</div>;
  if (eligibilityError)
    return <div>Failed to check eligibility: {eligibilityError.message}</div>;
  if (!isBlikEligible)
    return <div>BLIK is not eligible for this configuration.</div>;

  return <>{children}</>;
}

const withBlikEligibility: Decorator = (Story) => (
  <BlikEligibilityWrapper>
    <Story />
  </BlikEligibilityWrapper>
);

const meta: Meta<typeof BlikOneTimePaymentButton> = {
  title: "V6/Local Payment Methods/BLIK",
  component: BlikOneTimePaymentButton,
  decorators: [withBlikEligibility],
  parameters: {
    sdkComponents: ["blik-payments"],
    testBuyerCountry: "PL",
  },
  argTypes: {
    type: buttonTypeArgType,
    presentationMode: presentationModeArgType,
    disabled: disabledArgType,
  },
};

export default meta;

type Story = StoryObj<typeof BlikOneTimePaymentButton>;

export const Default: Story = {
  args: {
    createOrder: () => createOrder("PLN"),
    presentationMode: "popup",
    fieldValues: {
      name: "Test Buyer",
      email: "test-buyer@example.com",
    },
    ...oneTimePaymentCallbacks,
  },
};
