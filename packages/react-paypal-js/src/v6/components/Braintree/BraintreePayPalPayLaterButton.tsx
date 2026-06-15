import React, { useEffect } from "react";

import { useBraintreePayPalPayLaterSession } from "../../hooks/Braintree/useBraintreePayPalPayLaterSession";
import { useBraintreePayPal } from "../../hooks/Braintree/useBraintreePayPal";

import type { UseBraintreePayPalPayLaterSessionProps } from "../../hooks/Braintree/useBraintreePayPalPayLaterSession";

export type BraintreePayPalPayLaterButtonProps =
  UseBraintreePayPalPayLaterSessionProps & {
    disabled?: boolean;
  };

/**
 * `BraintreePayPalPayLaterButton` is a prebuilt button that renders a
 * `<paypal-pay-later-button>` web component and manages the Braintree PayPal
 * Pay Later (Buy Now, Pay Later) flow.
 *
 * Combines {@link UseBraintreePayPalPayLaterSessionProps} and a `disabled` prop.
 * Must be rendered inside a BraintreePayPalProvider.
 *
 * **Requires eligibility data.** This component reads `countryCode` and
 * `productCode` from `useBraintreePayPal().eligiblePaymentMethods`, which is
 * populated by `useBraintreeEligibleMethods`. **Without eligibility, the button
 * renders with `display: none` and is invisible.** Wait for eligibility before
 * rendering.
 *
 * For full control over the button UI, use the {@link useBraintreePayPalPayLaterSession}
 * hook directly instead.
 *
 * @example
 * function CheckoutButtons() {
 *   const { braintreePayPalCheckoutInstance } = useBraintreePayPal();
 *   // Wait for eligibility to be determined before rendering buttons
 *   const { eligiblePaymentMethods, isLoading } = useBraintreeEligibleMethods({
 *     amount, // dynamic checkout amount that can be used for eligibility checks
 *     currency: "USD",
 *     countryCode: "US",
 *     paymentFlow: "ONE_TIME_PAYMENT",
 *   });
 *   if (isLoading) return <Spinner />;
 *
 *   const handleOnApprove = async (data) => {
 *     const { nonce } = await braintreePayPalCheckoutInstance.tokenizePayment(data);
 *     // Send nonce to your server to complete the transaction
 *   };
 *
 *   if (!eligiblePaymentMethods?.isEligible("paylater")) {
 *     return null;
 *   }
 *
 *   return (
 *     <BraintreePayPalPayLaterButton
 *       amount="100"
 *       currency="USD"
 *       onApprove={handleOnApprove}
 *       // ...other props (onCancel, onError, etc.)
 *     />
 *   );
 * }
 */
export const BraintreePayPalPayLaterButton = ({
  disabled = false,
  ...hookProps
}: BraintreePayPalPayLaterButtonProps): JSX.Element | null => {
  const { eligiblePaymentMethods, isHydrated } = useBraintreePayPal();
  const { error, isPending, handleClick } =
    useBraintreePayPalPayLaterSession(hookProps);

  const payLaterDetails = eligiblePaymentMethods?.getDetails("paylater");

  useEffect(() => {
    if (error) {
      console.error(error);
    }
  }, [error]);

  return isHydrated ? (
    <paypal-pay-later-button
      onClick={handleClick}
      countryCode={payLaterDetails?.countryCode}
      productCode={payLaterDetails?.productCode}
      disabled={disabled || isPending || error !== null ? true : undefined}
    ></paypal-pay-later-button>
  ) : (
    <div />
  );
};
