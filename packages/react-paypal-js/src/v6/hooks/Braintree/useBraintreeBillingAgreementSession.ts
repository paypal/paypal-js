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

export type UseBraintreeBillingAgreementSessionProps =
  BraintreeBillingAgreementSessionOptions;

export interface UseBraintreeBillingAgreementSessionReturn {
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
 * @returns Object with: `error` (any session error), `isPending` (checkout instance loading), `handleClick` (starts session)
 *
 * @example
 * function BraintreeVaultButton() {
 *   const { braintreePayPalCheckoutInstance } = useBraintreePayPal();
 *   const { isPending, error, handleClick } = useBraintreeBillingAgreementSession({
 *     billingAgreementDescription: "Monthly subscription",
 *     planType: "SUBSCRIPTION",
 *     planMetadata: {
 *       currencyIsoCode: "USD",
 *       name: "Premium Plan",
 *       billingCycles: [{
 *         billingFrequency: 1,
 *         billingFrequencyUnit: "MONTH",
 *         numberOfExecutions: 0,
 *         sequence: 1,
 *         startDate: "2025-12-01T00:00:00Z",
 *         trial: false,
 *         pricingScheme: { pricingModel: "FIXED", price: "9.99" },
 *       }],
 *     },
 *     onApprove: async (data) => {
 *       const payload = await braintreePayPalCheckoutInstance.tokenizePayment({
 *         billingToken: data.billingToken,
 *       });
 *       // Send payload.nonce to your server
 *     },
 *   });
 *
 *   if (isPending) return null;
 *   if (error) return <div>Error: {error.message}</div>;
 *
 *   return <button onClick={handleClick}>Save Payment Method</button>;
 * }
 */
export function useBraintreeBillingAgreementSession({
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
}: UseBraintreeBillingAgreementSessionProps): UseBraintreeBillingAgreementSessionReturn {
  const { braintreePayPalCheckoutInstance, loadingStatus } =
    useBraintreePayPal();
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
      setError(new Error("Braintree checkout instance not available"));
    }
  }, [braintreePayPalCheckoutInstance, setError, loadingStatus]);

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
