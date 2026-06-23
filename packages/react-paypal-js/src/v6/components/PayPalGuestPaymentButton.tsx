import React, { useEffect } from "react";

import { usePayPalGuestPaymentSession } from "../hooks/usePayPalGuestPaymentSession";
import { usePayPal } from "../hooks/usePayPal";

import type { UsePayPalGuestPaymentSessionProps } from "../hooks/usePayPalGuestPaymentSession";

type PayPalGuestPaymentButtonProps = UsePayPalGuestPaymentSessionProps & {
  disabled?: boolean;
};

/**
 * `PayPalGuestPaymentButton` is a button that provides a guest checkout (BCDC) payment flow.
 *
 * `PayPalGuestPaymentButtonProps` combines the arguments for {@link UsePayPalGuestPaymentSessionProps}
 * with a `disabled` prop.
 *
 * This component automatically wraps the button with `<paypal-basic-card-container>` which is
 * required for the guest checkout form to display properly.
 *
 * The optional `buyerCountry` (forwarded to {@link usePayPalGuestPaymentSession}) is applied to
 * the underlying `<paypal-basic-card-button>` via its DOM property, so it works on all supported
 * React versions.
 *
 * @example
 * <PayPalGuestPaymentButton
 *   createOrder={createOrder}
 *   buyerCountry="US"
 *   onApprove={() => {
 *      // ... on approve logic
 *   }}
 * />
 */
export const PayPalGuestPaymentButton = ({
  disabled = false,
  ...hookProps
}: PayPalGuestPaymentButtonProps): JSX.Element | null => {
  const { error, isPending, handleClick, buttonRef } =
    usePayPalGuestPaymentSession(hookProps);
  const { isHydrated } = usePayPal();

  useEffect(() => {
    if (error) {
      console.error(error);
    }
  }, [error]);

  const button = isHydrated ? (
    <paypal-basic-card-button
      ref={buttonRef}
      onClick={handleClick}
      disabled={disabled || isPending || error !== null ? true : undefined}
    ></paypal-basic-card-button>
  ) : (
    <div />
  );

  return <paypal-basic-card-container>{button}</paypal-basic-card-container>;
};
