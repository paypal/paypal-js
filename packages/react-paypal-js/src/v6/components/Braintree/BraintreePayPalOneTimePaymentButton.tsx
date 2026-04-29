import React, { useEffect } from "react";

import { useBraintreePayPalOneTimePaymentSession } from "../../hooks/Braintree/useBraintreePayPalOneTimePaymentSession";
import { useBraintreePayPal } from "../../hooks/Braintree/useBraintreePayPal";

import type { ButtonProps } from "../../types";
import type { UseBraintreePayPalOneTimePaymentSessionProps } from "../../hooks/Braintree/useBraintreePayPalOneTimePaymentSession";

type BraintreePayPalButtonProps = UseBraintreePayPalOneTimePaymentSessionProps &
  ButtonProps;

/**
 * `BraintreePayPalOneTimePaymentButton` is a button that provides a Braintree PayPal one-time payment flow.
 *
 * `BraintreePayPalButtonProps` combines the arguments for {@link UseBraintreePayPalOneTimePaymentSessionProps}
 * and {@link ButtonProps}.
 *
 * Must be rendered inside a {@link BraintreePayPalProvider}.
 *
 * @example
 * <BraintreePayPalOneTimePaymentButton
 *   amount="10.00"
 *   currency="USD"
 *   onApprove={async (data) => {
 *     const payload = await braintreePayPalCheckoutInstance.tokenizePayment({
 *       payerID: data.payerId,
 *       orderID: data.orderId,
 *     });
 *     // Send payload.nonce to your server
 *   }}
 * />
 */
export const BraintreePayPalOneTimePaymentButton = ({
  type = "pay",
  disabled = false,
  // Callbacks
  onApprove,
  onCancel,
  onError,
  onShippingAddressChange,
  onShippingOptionsChange,
  // Primitive data options
  amount,
  currency,
  intent,
  commit,
  offerCredit,
  userAuthenticationEmail,
  returnUrl,
  cancelUrl,
  displayName,
  presentationMode,
  // Object/array data options
  lineItems,
  shippingOptions,
  amountBreakdown,
}: BraintreePayPalButtonProps): JSX.Element | null => {
  const { error, isPending, handleClick } =
    useBraintreePayPalOneTimePaymentSession({
      onApprove,
      onCancel,
      onError,
      onShippingAddressChange,
      onShippingOptionsChange,
      amount,
      currency,
      intent,
      commit,
      offerCredit,
      userAuthenticationEmail,
      returnUrl,
      cancelUrl,
      displayName,
      presentationMode,
      lineItems,
      shippingOptions,
      amountBreakdown,
    });
  const { isHydrated } = useBraintreePayPal();

  useEffect(() => {
    if (error) {
      console.error(error);
    }
  }, [error]);

  return isHydrated ? (
    <paypal-button
      onClick={handleClick}
      type={type}
      disabled={disabled || isPending || error !== null ? true : undefined}
    ></paypal-button>
  ) : (
    <div />
  );
};
