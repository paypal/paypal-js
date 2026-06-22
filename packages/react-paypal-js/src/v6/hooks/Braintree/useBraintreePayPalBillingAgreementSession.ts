import { useCallback, useEffect, useRef } from "react";

import { useBraintreePayPal } from "./useBraintreePayPal";
import { useIsMountedRef } from "../useIsMounted";
import { useError } from "../useError";
import {
  createPaymentSession,
  useProxyProps,
  useDeepCompareMemoize,
} from "../../utils";
import { INSTANCE_LOADING_STATE } from "../../types/ProviderEnums";

import type {
  BraintreeBillingAgreementSessionOptions,
  BraintreePaymentSession,
} from "../../types/braintree";

export type UseBraintreePayPalBillingAgreementSessionProps =
  BraintreeBillingAgreementSessionOptions;

export interface UseBraintreePayPalBillingAgreementSessionReturn {
  error: Error | null;
  isPending: boolean;
  handleClick: () => void;
}

/**
 * Hook for managing billing agreement sessions with Braintree PayPal.
 *
 * Supports all billing agreement plan types: basic vault-only (no planType),
 * RECURRING, SUBSCRIPTION, UNSCHEDULED, and INSTALLMENTS.
 *
 * The hook returns an `isPending` flag that indicates whether the Braintree checkout
 * instance is still being initialized. Buttons should wait to render until `isPending`
 * is false.
 *
 * For a ready-to-use component that wraps this hook, see `BraintreePayPalBillingAgreementButton`.
 *
 * @returns Object with: `error` (any session error), `isPending` (checkout instance loading), `handleClick` (starts session)
 *
 * @example
 * // Custom button using the hook directly with a <paypal-button> web component
 * function PayPalBillingAgreementButton(props: UseBraintreePayPalBillingAgreementSessionProps) {
 *   const { isPending, handleClick } = useBraintreePayPalBillingAgreementSession(props);
 *
 *   return (
 *     <paypal-button
 *       type="checkout"
 *       onClick={() => handleClick()}
 *       disabled={isPending}
 *     />
 *   );
 * }
 *
 * // Usage with tokenization in onApprove:
 * function Checkout() {
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
 *     <PayPalBillingAgreementButton
 *       onApprove={handleApprove}
 *       onCancel={(data) => console.log("onCancel", data)}
 *       onError={(err) => console.error("onError", err)}
 *     />
 *   );
 * }
 *
 * @example
 * // Subscription billing agreement with plan metadata
 * <PayPalBillingAgreementButton
 *   billingAgreementDescription="Monthly subscription"
 *   planType="SUBSCRIPTION"
 *   planMetadata={{
 *     currencyIsoCode: "USD",
 *     name: "Premium Plan",
 *     billingCycles: [{
 *       billingFrequency: 1,
 *       billingFrequencyUnit: "MONTH",
 *       numberOfExecutions: 0,
 *       sequence: 1,
 *       startDate: "2025-12-01T00:00:00Z",
 *       trial: false,
 *       pricingScheme: { pricingModel: "FIXED", price: "9.99" },
 *     }],
 *   }}
 *   onApprove={handleApprove}
 * />
 */
export function useBraintreePayPalBillingAgreementSession({
  // Callbacks
  onApprove,
  onCancel,
  onError: onErrorCallback,
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
  // Object data options (require deep comparison)
  planMetadata,
  shippingAddressOverride,
}: UseBraintreePayPalBillingAgreementSessionProps): UseBraintreePayPalBillingAgreementSessionReturn {
  const {
    braintreePayPalCheckoutInstance,
    loadingStatus,
    error: contextError,
  } = useBraintreePayPal();
  const isMountedRef = useIsMountedRef();
  const sessionRef = useRef<BraintreePaymentSession | null>(null);
  const [error, setError] = useError();

  const failedInstanceRef = useRef<unknown>(null);

  const proxyCallbacks = useProxyProps({
    onApprove,
    onCancel,
    onError: onErrorCallback,
  });

  const memoizedPlanMetadata = useDeepCompareMemoize(planMetadata);
  const memoizedShippingAddressOverride = useDeepCompareMemoize(
    shippingAddressOverride,
  );

  const isPending = loadingStatus === INSTANCE_LOADING_STATE.PENDING;

  useEffect(() => {
    if (failedInstanceRef.current !== braintreePayPalCheckoutInstance) {
      failedInstanceRef.current = null;
    }

    if (braintreePayPalCheckoutInstance) {
      setError(null);
    } else if (loadingStatus !== INSTANCE_LOADING_STATE.PENDING) {
      setError(
        contextError
          ? new Error(`Braintree provider error: ${contextError.message}`, {
              cause: contextError,
            })
          : new Error(
              "Braintree Billing Agreement checkout instance not available",
            ),
      );
    }
  }, [braintreePayPalCheckoutInstance, setError, loadingStatus, contextError]);

  useEffect(() => {
    if (!braintreePayPalCheckoutInstance) {
      return;
    }

    const newSession = createPaymentSession({
      sessionCreator: () =>
        braintreePayPalCheckoutInstance.createBillingAgreementSession({
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
          planMetadata: memoizedPlanMetadata,
          shippingAddressOverride: memoizedShippingAddressOverride,
          ...proxyCallbacks,
        }),
      failedSdkRef: failedInstanceRef,
      sdkInstance: braintreePayPalCheckoutInstance,
      setError,
      errorMessage:
        "Failed to create Braintree billing agreement session. Ensure the BraintreePayPalProvider is properly initialized with a valid client token and namespace.",
    });

    if (!newSession) {
      return;
    }

    sessionRef.current = newSession;

    return () => {
      sessionRef.current = null;
    };
  }, [
    braintreePayPalCheckoutInstance,
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
    memoizedPlanMetadata,
    memoizedShippingAddressOverride,
    proxyCallbacks,
    setError,
  ]);

  const handleClick = useCallback(() => {
    if (!isMountedRef.current) {
      return;
    }

    if (!sessionRef.current) {
      setError(new Error("Braintree billing agreement session not available"));
      return;
    }

    sessionRef.current.start();
  }, [isMountedRef, setError]);

  return {
    error,
    isPending,
    handleClick,
  };
}
