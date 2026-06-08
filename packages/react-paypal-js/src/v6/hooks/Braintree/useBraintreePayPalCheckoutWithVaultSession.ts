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
  BraintreeCheckoutWithVaultSessionOptions,
  BraintreePaymentSession,
} from "../../types/braintree";

export type UseBraintreePayPalCheckoutWithVaultSessionProps =
  BraintreeCheckoutWithVaultSessionOptions;

export interface UseBraintreePayPalCheckoutWithVaultSessionReturn {
  error: Error | null;
  isPending: boolean;
  handleClick: () => void;
}

/**
 * Hook for managing checkout with vault sessions with Braintree PayPal.
 *
 * Combines a one-time charge and billing agreement consent in a single flow,
 * enabling merchants to charge a customer and save their payment method together.
 *
 * The hook returns an `isPending` flag that indicates whether the Braintree checkout
 * instance is still being initialized. Buttons should wait to render until `isPending`
 * is false.
 *
 * @returns Object with: `error` (any session error), `isPending` (checkout instance loading), `handleClick` (starts session)
 *
 * @example
 * function BraintreeCheckoutWithVaultButton() {
 *   const { braintreePayPalCheckoutInstance } = useBraintreePayPal();
 *   const { isPending, error, handleClick } = useBraintreePayPalCheckoutWithVaultSession({
 *     amount: "10.00",
 *     currency: "USD",
 *     billingAgreementDetails: { description: "Save payment method for future use" },
 *     onApprove: async (data) => {
 *       const payload = await braintreePayPalCheckoutInstance.tokenizePayment({
 *         payerID: data.payerId,
 *         orderID: data.orderId,
 *       });
 *       // Send payload.nonce to your server
 *     },
 *   });
 *
 *   if (isPending) return null;
 *   if (error) return <div>Error: {error.message}</div>;
 *
 *   return <button onClick={handleClick}>Pay and Save Payment Method</button>;
 * }
 */
export function useBraintreePayPalCheckoutWithVaultSession({
  // Callbacks
  onApprove,
  onCancel,
  onError: onErrorCallback,
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
  // Object/array data options (require deep comparison)
  billingAgreementDetails,
  lineItems,
  shippingOptions,
  amountBreakdown,
}: UseBraintreePayPalCheckoutWithVaultSessionProps): UseBraintreePayPalCheckoutWithVaultSessionReturn {
  const {
    braintreePayPalCheckoutInstance,
    loadingStatus,
    error: contextError,
  } = useBraintreePayPal();
  const isMountedRef = useIsMountedRef();
  const sessionRef = useRef<BraintreePaymentSession | null>(null);
  const [error, setError] = useError();

  // Prevents retrying session creation with a failed checkout instance
  const failedInstanceRef = useRef<unknown>(null);

  const proxyCallbacks = useProxyProps({
    onApprove,
    onCancel,
    onError: onErrorCallback,
    onShippingAddressChange,
    onShippingOptionsChange,
  });

  // Deep-memoize only object/array options that consumers may pass inline
  const memoizedBillingAgreementDetails = useDeepCompareMemoize(
    billingAgreementDetails,
  );
  const memoizedLineItems = useDeepCompareMemoize(lineItems);
  const memoizedShippingOptions = useDeepCompareMemoize(shippingOptions);
  const memoizedAmountBreakdown = useDeepCompareMemoize(amountBreakdown);

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
              "Braintree Checkout With Vault checkout instance not available",
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
        braintreePayPalCheckoutInstance.createCheckoutWithVaultSession({
          amount,
          currency,
          intent,
          commit,
          userAuthenticationEmail,
          returnUrl,
          cancelUrl,
          displayName,
          presentationMode,
          billingAgreementDetails: memoizedBillingAgreementDetails,
          lineItems: memoizedLineItems,
          shippingOptions: memoizedShippingOptions,
          amountBreakdown: memoizedAmountBreakdown,
          ...proxyCallbacks,
        }),
      failedSdkRef: failedInstanceRef,
      sdkInstance: braintreePayPalCheckoutInstance,
      setError,
      errorMessage:
        "Failed to create Braintree checkout with vault session. Ensure the BraintreePayPalProvider is properly initialized with a valid client token and namespace.",
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
    amount,
    currency,
    intent,
    commit,
    userAuthenticationEmail,
    returnUrl,
    cancelUrl,
    displayName,
    presentationMode,
    memoizedBillingAgreementDetails,
    memoizedLineItems,
    memoizedShippingOptions,
    memoizedAmountBreakdown,
    proxyCallbacks,
    setError,
  ]);

  const handleClick = useCallback(() => {
    if (!isMountedRef.current) {
      return;
    }

    if (!sessionRef.current) {
      setError(
        new Error("Braintree checkout with vault session not available"),
      );
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
