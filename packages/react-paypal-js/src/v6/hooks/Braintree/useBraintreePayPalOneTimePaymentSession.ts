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
  BraintreeOneTimePaymentSessionOptions,
  BraintreePaymentSession,
} from "../../types/braintree";

export type UseBraintreePayPalOneTimePaymentSessionProps =
  BraintreeOneTimePaymentSessionOptions;

export interface UseBraintreePayPalOneTimePaymentSessionReturn {
  error: Error | null;
  isPending: boolean;
  handleClick: () => void;
}

/**
 * Hook for managing one-time payment sessions with Braintree PayPal.
 *
 * The hook returns an `isPending` flag that indicates whether the Braintree checkout
 * instance is still being initialized. Buttons should wait to render until `isPending`
 * is false.
 *
 * For a ready-to-use component that wraps this hook, see {@link BraintreePayPalOneTimePaymentButton}.
 *
 * @returns Object with: `error` (any session error), `isPending` (checkout instance loading), `handleClick` (starts session)
 *
 * @example
 * // Custom button using the hook directly with a <paypal-button> web component
 * function PayPalOneTimePaymentButton(props: UseBraintreePayPalOneTimePaymentSessionProps) {
 *   const { isPending, handleClick } = useBraintreePayPalOneTimePaymentSession(props);
 *
 *   return (
 *     <paypal-button
 *       type="pay"
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
 *   const handleOnApprove = async (data) => {
 *     const { nonce } = await braintreePayPalCheckoutInstance.tokenizePayment({
 *       orderID: data.orderId,
 *       payerID: data.payerId,
 *     });
 *     // Send nonce to your server to complete the transaction
 *   };
 *
 *   return (
 *     <PayPalOneTimePaymentButton
 *       amount="10.00"
 *       currency="USD"
 *       onApprove={handleOnApprove}
 *     />
 *   );
 * }
 */
export function useBraintreePayPalOneTimePaymentSession({
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
  offerCredit,
  userAuthenticationEmail,
  returnUrl,
  cancelUrl,
  displayName,
  presentationMode,
  // Object/array data options (require deep comparison)
  lineItems,
  shippingOptions,
  amountBreakdown,
}: UseBraintreePayPalOneTimePaymentSessionProps): UseBraintreePayPalOneTimePaymentSessionReturn {
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
  const memoizedLineItems = useDeepCompareMemoize(lineItems);
  const memoizedShippingOptions = useDeepCompareMemoize(shippingOptions);
  const memoizedAmountBreakdown = useDeepCompareMemoize(amountBreakdown);

  const isPending = loadingStatus === INSTANCE_LOADING_STATE.PENDING;

  // Handle checkout instance availability
  useEffect(() => {
    // Reset failed instance tracking when checkout instance changes
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
              "Braintree One-Time Payment checkout instance not available",
            ),
      );
    }
  }, [braintreePayPalCheckoutInstance, setError, loadingStatus, contextError]);

  // Create and manage session lifecycle
  useEffect(() => {
    if (!braintreePayPalCheckoutInstance) {
      return;
    }

    const newSession = createPaymentSession({
      sessionCreator: () =>
        braintreePayPalCheckoutInstance.createOneTimePaymentSession({
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
          lineItems: memoizedLineItems,
          shippingOptions: memoizedShippingOptions,
          amountBreakdown: memoizedAmountBreakdown,
          ...proxyCallbacks,
        }),
      failedSdkRef: failedInstanceRef,
      sdkInstance: braintreePayPalCheckoutInstance,
      setError,
      errorMessage:
        "Failed to create Braintree payment session. Ensure the BraintreePayPalProvider is properly initialized with a valid client token and namespace.",
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
    offerCredit,
    userAuthenticationEmail,
    returnUrl,
    cancelUrl,
    displayName,
    presentationMode,
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
      setError(new Error("Braintree payment session not available"));
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
