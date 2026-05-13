import React, { useEffect } from "react";

import { useBraintreeBillingAgreementSession } from "../../hooks/Braintree/useBraintreeBillingAgreementSession";
import { useBraintreePayPal } from "../../hooks/Braintree/useBraintreePayPal";

import type { ButtonProps } from "../../types";
import type { UseBraintreeBillingAgreementSessionProps } from "../../hooks/Braintree/useBraintreeBillingAgreementSession";

export type BraintreeBillingAgreementButtonProps =
  UseBraintreeBillingAgreementSessionProps & ButtonProps;

/**
 * `BraintreeBillingAgreementButton` is a prebuilt button that renders a `<paypal-button>`
 * web component and manages the Braintree PayPal billing agreement flow.
 *
 * Combines {@link UseBraintreeBillingAgreementSessionProps} and {@link ButtonProps}.
 * Must be rendered inside a {@link BraintreePayPalProvider}.
 *
 * For full control over the button UI, use the {@link useBraintreeBillingAgreementSession}
 * hook directly instead.
 *
 * @example
 * function CheckoutButtons() {
 *   const { braintreePayPalCheckoutInstance } = useBraintreePayPal();
 *
 *   const handleApprove = async (data) => {
 *     const { nonce } = await braintreePayPalCheckoutInstance.tokenizePayment({
 *       billingToken: data.billingToken,
 *     });
 *     // Send nonce to your server to vault the payment method
 *   };
 *
 *   return (
 *     <BraintreeBillingAgreementButton
 *       onApprove={handleApprove}
 *       onCancel={(data) => console.log("onCancel", data)}
 *       onError={(err) => console.error("onError", err)}
 *     />
 *   );
 * }
 */
export const BraintreeBillingAgreementButton = ({
  type = "pay",
  disabled = false,
  // Callbacks
  onApprove,
  onCancel,
  onError,
  // Primitive data options
  billingAgreementDescription,
  planType,
  amount,
  currency,
  offerCredit,
  userAction,
  displayName,
  returnUrl,
  cancelUrl,
  presentationMode,
  // Object data options
  planMetadata,
  shippingAddressOverride,
}: BraintreeBillingAgreementButtonProps): JSX.Element | null => {
  const { error, isPending, handleClick } = useBraintreeBillingAgreementSession(
    {
      onApprove,
      onCancel,
      onError,
      billingAgreementDescription,
      planType,
      amount,
      currency,
      offerCredit,
      userAction,
      displayName,
      returnUrl,
      cancelUrl,
      presentationMode,
      planMetadata,
      shippingAddressOverride,
    },
  );
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
