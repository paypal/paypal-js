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
  BraintreePayLaterSessionOptions,
  BraintreePaymentSession,
} from "../../types/braintree";

export type UseBraintreePayPalPayLaterSessionProps =
  BraintreePayLaterSessionOptions;

export interface UseBraintreePayPalPayLaterSessionReturn {
  error: Error | null;
  isPending: boolean;
  handleClick: () => void;
}

/**
 * Hook for managing Pay Later (Buy Now, Pay Later) sessions with Braintree PayPal.
 *
 * The hook returns an `isPending` flag that indicates whether the Braintree checkout
 * instance is still being initialized. Buttons should wait to render until `isPending`
 * is false.
 *
 * @returns Object with: `error` (any session error), `isPending` (checkout instance loading), `handleClick` (starts session)
 *
 * @example
 * // Custom button using the hook directly with a <paypal-button> web component
 * function PayPalPayLaterButton(props: UseBraintreePayPalPayLaterSessionProps) {
 *   const { isPending, handleClick } = useBraintreePayPalPayLaterSession(props);
 *
 *   return (
 *     <paypal-button
 *       type="pay"
 *       fundingSource="paylater"
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
 *     <PayPalPayLaterButton
 *       amount="100.00"
 *       currency="USD"
 *       onApprove={handleOnApprove}
 *     />
 *   );
 * }
 */
export function useBraintreePayPalPayLaterSession({
  // Callbacks
  onApprove,
  onCancel,
  onComplete,
  onError: onErrorCallback,
  onShippingAddressChange,
  onShippingOptionsChange,
  // Primitive data options
  amount,
  currency,
  intent,
  userAuthenticationEmail,
  returnUrl,
  cancelUrl,
  displayName,
  presentationMode,
  // Object/array data options (require deep comparison)
  lineItems,
  shippingOptions,
  amountBreakdown,
}: UseBraintreePayPalPayLaterSessionProps): UseBraintreePayPalPayLaterSessionReturn {
  const { braintreePayPalCheckoutInstance, loadingStatus } =
    useBraintreePayPal();
  const isMountedRef = useIsMountedRef();
  const sessionRef = useRef<BraintreePaymentSession | null>(null);
  const [error, setError] = useError();

  // Prevents retrying session creation with a failed checkout instance
  const failedInstanceRef = useRef<unknown>(null);

  const proxyCallbacks = useProxyProps({
    onApprove,
    onCancel,
    onComplete,
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
      setError(new Error("Braintree checkout instance not available"));
    }
  }, [braintreePayPalCheckoutInstance, setError, loadingStatus]);

  // Create and manage session lifecycle
  useEffect(() => {
    if (!braintreePayPalCheckoutInstance) {
      return;
    }

    const newSession = createPaymentSession({
      sessionCreator: () =>
        braintreePayPalCheckoutInstance.createPayLaterSession({
          amount,
          currency,
          intent,
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
        "Failed to create Braintree Pay Later session. Ensure the BraintreePayPalProvider is properly initialized with a valid client token and namespace.",
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
