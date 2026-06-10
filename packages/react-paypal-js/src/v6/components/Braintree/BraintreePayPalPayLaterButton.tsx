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
 * The `countryCode` and `productCode` are automatically populated from the Braintree
 * eligibility result (available via `useBraintreePayPal().eligiblePaymentMethods`).
 * Configure eligibility with the `useBraintreeEligibleMethods` hook.
 *
 * For full control over the button UI, use the {@link useBraintreePayPalPayLaterSession}
 * hook directly instead.
 *
 * @example
 * function CheckoutButtons() {
 *   const { braintreePayPalCheckoutInstance } = useBraintreePayPal();
 *
 *   const handleOnApprove = async (data) => {
 *     const { nonce } = await braintreePayPalCheckoutInstance.tokenizePayment({
 *       orderID: data.orderId,
 *       payerID: data.payerId,
 *     });
 *     // Send nonce to your server to complete the transaction
 *   };
 *
 *   return (
 *     <BraintreePayPalPayLaterButton
 *       amount="100"
 *       currency="USD"
 *       onApprove={handleOnApprove}
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
