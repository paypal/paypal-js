import React, { useEffect } from "react";

import { useBraintreePayPalCheckoutWithVaultSession } from "../../hooks/Braintree/useBraintreePayPalCheckoutWithVaultSession";
import { useBraintreePayPal } from "../../hooks/Braintree/useBraintreePayPal";

import type { ButtonProps } from "../../types";
import type { UseBraintreePayPalCheckoutWithVaultSessionProps } from "../../hooks/Braintree/useBraintreePayPalCheckoutWithVaultSession";

export type BraintreeCheckoutWithVaultButtonProps =
  UseBraintreePayPalCheckoutWithVaultSessionProps & ButtonProps;

/**
 * `BraintreeCheckoutWithVaultButton` is a button that provides a Braintree PayPal checkout with vault flow.
 *
 * `BraintreeCheckoutWithVaultButtonProps` combines the arguments for {@link UseBraintreePayPalCheckoutWithVaultSessionProps}
 * and {@link ButtonProps}.
 *
 * Must be rendered inside a `BraintreePayPalProvider`.
 *
 * @example
 * <BraintreeCheckoutWithVaultButton
 *   amount="10.00"
 *   currency="USD"
 *   billingAgreementDetails={{ description: "Save payment method for future use" }}
 *   onApprove={async (data) => {
 *     const payload = await braintreePayPalCheckoutInstance.tokenizePayment({
 *       payerID: data.payerId,
 *       orderID: data.orderId,
 *     });
 *     // Send payload.nonce to your server
 *   }}
 * />
 */
export const BraintreeCheckoutWithVaultButton = ({
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
  userAuthenticationEmail,
  returnUrl,
  cancelUrl,
  displayName,
  presentationMode,
  // Object/array data options
  billingAgreementDetails,
  lineItems,
  shippingOptions,
  amountBreakdown,
}: BraintreeCheckoutWithVaultButtonProps): JSX.Element | null => {
  const { error, isPending, handleClick } =
    useBraintreePayPalCheckoutWithVaultSession({
      onApprove,
      onCancel,
      onError,
      onShippingAddressChange,
      onShippingOptionsChange,
      amount,
      currency,
      intent,
      commit,
      userAuthenticationEmail,
      returnUrl,
      cancelUrl,
      displayName,
      presentationMode,
      billingAgreementDetails,
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
