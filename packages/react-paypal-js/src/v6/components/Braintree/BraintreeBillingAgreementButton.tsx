import React, { useEffect } from "react";

import { useBraintreeBillingAgreementSession } from "../../hooks/Braintree/useBraintreeBillingAgreementSession";
import { useBraintreePayPal } from "../../hooks/Braintree/useBraintreePayPal";

import type { ButtonProps } from "../../types";
import type { UseBraintreeBillingAgreementSessionProps } from "../../hooks/Braintree/useBraintreeBillingAgreementSession";

export type BraintreeBillingAgreementButtonProps =
  UseBraintreeBillingAgreementSessionProps & ButtonProps;

/**
 * `BraintreeBillingAgreementButton` is a button that provides a Braintree PayPal billing agreement flow.
 *
 * `BraintreeBillingAgreementButtonProps` combines the arguments for {@link UseBraintreeBillingAgreementSessionProps}
 * and {@link ButtonProps}.
 *
 * Must be rendered inside a `BraintreePayPalProvider`.
 *
 * @example
 * <BraintreeBillingAgreementButton
 *   type="subscribe"
 *   billingAgreementDescription="Monthly subscription"
 *   planType="SUBSCRIPTION"
 *   onApprove={async (data) => {
 *     const payload = await braintreePayPalCheckoutInstance.tokenizePayment({
 *       billingToken: data.billingToken,
 *     });
 *     // Send payload.nonce to your server
 *   }}
 * />
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
