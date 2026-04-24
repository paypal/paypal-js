import type { Decorator } from "@storybook/react";
import { PaymentResult } from "../shared/PaymentResult";

export const withPaymentResult: Decorator = (Story) => (
  <>
    <Story />
    <PaymentResult />
  </>
);
