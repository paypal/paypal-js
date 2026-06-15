import React, { useEffect } from "react";

import { usePayLaterOneTimePaymentSession } from "../hooks/usePayLaterOneTimePaymentSession";
import { usePayPal } from "../hooks/usePayPal";

import type { UsePayLaterOneTimePaymentSessionProps } from "../hooks/usePayLaterOneTimePaymentSession";

export type PayLaterOneTimePaymentButtonProps =
  UsePayLaterOneTimePaymentSessionProps & {
    autoRedirect?: never;
    disabled?: boolean;
  };

/**
 * `PayLaterOneTimePaymentButton` is a button that provides a PayLater payment flow.
 *
 * `PayLaterOneTimePaymentButtonProps` combines the arguments for {@link UsePayLaterOneTimePaymentSessionProps}
 * with a `disabled` prop.
 *
 * The `countryCode` and `productCode` are automatically populated from the eligibility API response
 * (available via `usePayPal().eligiblePaymentMethods`). The button requires eligibility to be configured
 * in the parent `PayPalProvider`, using either the `useEligibleMethods` hook client-side or
 * `useFetchEligibleMethods` server-side.
 *
 * **Eligibility must be fetched first.** Until eligibility is available, internally the button has no
 * `countryCode`/`productCode` to render with. Fetch eligibility (and wait for it) before rendering.
 *
 * Note, `autoRedirect` is not allowed because if given a `presentationMode` of `"redirect"` the button
 * would not be able to provide back `redirectURL` from `start`. Advanced integrations that need
 * `redirectURL` should use the {@link usePayLaterOneTimePaymentSession} hook directly.
 *
 * `presentationMode` is optional and defaults to `"auto"`.
 *
 * @example
 * function PayLaterCheckout() {
 *   // Fetch eligibility before rendering the button (or hydrate it server-side
 *   // via useFetchEligibleMethods)
 *   const { eligiblePaymentMethods, isLoading } = useEligibleMethods({
 *     payload: { purchase_units: [{ amount: { currency_code: "USD" } }] },
 *   });
 *
 *   if (isLoading) return <Spinner />;
 *   if (!eligiblePaymentMethods?.isEligible("paylater")) {
 *     return null;
 *   }
 *
 *   return (
 *     <PayLaterOneTimePaymentButton
 *       onApprove={() => {
 *         // ... on approve logic
 *       }}
 *       orderId="your-order-id"
 *     />
 *   );
 * }
 */
export const PayLaterOneTimePaymentButton = ({
  disabled = false,
  ...hookProps
}: PayLaterOneTimePaymentButtonProps): JSX.Element | null => {
  const { eligiblePaymentMethods, isHydrated } = usePayPal();
  const { error, isPending, handleClick } =
    usePayLaterOneTimePaymentSession(hookProps);

  const payLaterDetails = eligiblePaymentMethods?.getDetails("paylater");
  const countryCode = payLaterDetails?.countryCode;
  const productCode = payLaterDetails?.productCode;

  useEffect(() => {
    if (error) {
      console.error(error);
    }
  }, [error]);

  if (isPending) {
    return null;
  }

  return isHydrated ? (
    <paypal-pay-later-button
      onClick={handleClick}
      countryCode={countryCode}
      productCode={productCode}
      disabled={disabled || !!error || undefined}
    ></paypal-pay-later-button>
  ) : (
    <div />
  );
};
