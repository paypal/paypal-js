import type {
  PayPalOneTimePaymentSessionOptions,
  PayLaterOneTimePaymentSessionOptions,
  PayPalCreditOneTimePaymentSessionOptions,
} from "../v6";

// Regression guard for https://github.com/paypal/paypal-js/issues/1020:
// `onApprove` is required for one-time PayPal payment sessions. It must not
// be reintroduced as optional (e.g. via an intersection that fails to `Omit`
// it from `BasePaymentSessionOptions` first).

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function main() {
  // @ts-expect-error - onApprove is required
  const missingOnApprove: PayPalOneTimePaymentSessionOptions = {};

  const withOnApprove: PayPalOneTimePaymentSessionOptions = {
    onApprove: async () => {},
  };

  // Aliases must inherit the same required-onApprove contract.
  // @ts-expect-error - onApprove is required
  const payLaterMissing: PayLaterOneTimePaymentSessionOptions = {};

  // @ts-expect-error - onApprove is required
  const creditMissing: PayPalCreditOneTimePaymentSessionOptions = {};

  const payLater: PayLaterOneTimePaymentSessionOptions = {
    onApprove: async () => {},
  };

  const credit: PayPalCreditOneTimePaymentSessionOptions = {
    onApprove: async () => {},
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-expressions
  [
    missingOnApprove,
    withOnApprove,
    payLaterMissing,
    creditMissing,
    payLater,
    credit,
  ];
}
