import { useCallback, useEffect, useRef } from "react";

import { usePayPal } from "./usePayPal";
import { useIsMountedRef } from "./useIsMounted";
import { useError } from "./useError";
import { useProxyProps, createPaymentSession } from "../utils";
import { INSTANCE_LOADING_STATE } from "../types";

import type {
  PayPalGuestOneTimePaymentSession,
  PayPalGuestOneTimePaymentSessionOptions,
  PayPalGuestOneTimePaymentSessionPromise,
  PayPalGuestPresentationModeOptions,
} from "@paypal/paypal-js/sdk-v6";
import type { BasePaymentSessionReturn } from "../types";

interface PayPalGuestPaymentSessionReturn extends BasePaymentSessionReturn {
  buttonRef: { current: HTMLElement | null };
}
type PayPalGuestPresentationModeHookOptions = Omit<
  PayPalGuestPresentationModeOptions,
  "presentationMode" | "targetElement"
>;

export type UsePayPalGuestPaymentSessionProps = (
  | (Omit<PayPalGuestOneTimePaymentSessionOptions, "orderId"> & {
      createOrder: () => PayPalGuestOneTimePaymentSessionPromise;
      orderId?: never;
    })
  | (PayPalGuestOneTimePaymentSessionOptions & {
      createOrder?: never;
      orderId: string;
    })
) &
  PayPalGuestPresentationModeHookOptions & {
    /**
     * Buyer country (ISO 3166-1 alpha-2, e.g. `"US"`) used by the guest checkout session to
     * verify inline guest-checkout eligibility. It is applied to the target
     * `<paypal-basic-card-button>` via the DOM property (`element.buyerCountry`) so it works on
     * all supported React versions — a camelCase JSX prop would be lowercased to `buyercountry`
     * on React <19 and miss the element's `buyer-country` attribute.
     */
    buyerCountry?: string;
  };

/**
 * `usePayPalGuestPaymentSession` is used to interface with a guest checkout session. Guest checkout
 * sessions require a `<paypal-basic-card-button>` to target for displaying the guest checkout form.
 *
 * @returns Object with: `buttonRef` (ref for the target button element), `error` (any session error), `isPending` (SDK loading), `handleClick` (starts session), `handleCancel` (cancels session), `handleDestroy` (cleanup)
 *
 * @example
 * function GuestCheckoutButton() {
 *   const { buttonRef, error, isPending, handleClick, handleCancel } =
 *     usePayPalGuestPaymentSession({
 *       createOrder: async () => ({ orderId: 'ORDER-123' }),
 *       onApprove: (data) => console.log('Approved:', data),
 *       onCancel: () => console.log('Cancelled'),
 *       buyerCountry: 'US',
 *     });
 *
 *   if (isPending) return null;
 *   if (error) return <div>Error: {error.message}</div>;
 *
 *   return (
 *     <paypal-basic-card-container>
 *       <paypal-basic-card-button
 *         onClick={handleClick}
 *         onCancel={handleCancel}
 *         ref={buttonRef}
 *       />
 *     </paypal-basic-card-container>
 *   );
 * }
 */
export function usePayPalGuestPaymentSession({
  fullPageOverlay,
  createOrder,
  orderId,
  buyerCountry,
  onShippingAddressChange,
  onShippingOptionsChange,
  ...callbacks
}: UsePayPalGuestPaymentSessionProps): PayPalGuestPaymentSessionReturn {
  const { sdkInstance, loadingStatus } = usePayPal();
  const isMountedRef = useIsMountedRef();
  const sessionRef = useRef<PayPalGuestOneTimePaymentSession | null>(null);
  const buttonRef = useRef<HTMLElement>(null);
  const proxyCallbacks = useProxyProps(callbacks);
  const [error, setError] = useError();

  // Prevents retrying session creation with a failed SDK instance
  const failedSdkRef = useRef<unknown>(null);

  const isPending = loadingStatus === INSTANCE_LOADING_STATE.PENDING;

  const handleDestroy = useCallback(() => {
    sessionRef.current?.destroy();
    sessionRef.current = null;
  }, []);

  const handleCancel = useCallback(() => {
    sessionRef.current?.cancel();
  }, []);

  // Handle SDK availability
  useEffect(() => {
    // Reset failed SDK tracking when SDK instance changes
    if (failedSdkRef.current !== sdkInstance) {
      failedSdkRef.current = null;
    }

    if (sdkInstance) {
      setError(null);
    } else if (loadingStatus !== INSTANCE_LOADING_STATE.PENDING) {
      setError(new Error("no sdk instance available"));
    }
  }, [sdkInstance, setError, loadingStatus]);

  // Apply the optional buyerCountry to the target element via the DOM property channel.
  // The element's observed attribute is `buyer-country`; setting it as a property
  // (`element.buyerCountry`) works on all supported React versions, whereas a camelCase JSX
  // prop is lowercased to `buyercountry` on React <19 and never reaches the element.
  // Depends on `sdkInstance` so it re-applies once the button has mounted after SDK hydration.
  useEffect(() => {
    const targetElement = buttonRef.current as
      | (HTMLElement & { buyerCountry?: string })
      | null;
    if (targetElement && buyerCountry != null) {
      targetElement.buyerCountry = buyerCountry;
    }
  }, [buyerCountry, sdkInstance]);

  // Create and manage session lifecycle
  useEffect(() => {
    if (!sdkInstance) {
      return;
    }

    const newSession = createPaymentSession({
      sessionCreator: () =>
        sdkInstance.createPayPalGuestOneTimePaymentSession({
          orderId,
          ...proxyCallbacks,
          ...(onShippingAddressChange && { onShippingAddressChange }),
          ...(onShippingOptionsChange && { onShippingOptionsChange }),
        }),
      failedSdkRef,
      sdkInstance,
      setError,
      errorMessage:
        'Failed to create payment session. This may occur if the required component "paypal-guest-payments" is not included in the SDK components array.',
    });

    if (!newSession) {
      return;
    }

    sessionRef.current = newSession;

    return () => {
      newSession.destroy();
    };
  }, [
    sdkInstance,
    orderId,
    proxyCallbacks,
    onShippingAddressChange,
    onShippingOptionsChange,
    isMountedRef,
    setError,
  ]);

  const handleClick = useCallback(async () => {
    if (!isMountedRef.current) {
      return;
    }
    if (!sessionRef.current) {
      setError(new Error("PayPal Guest Checkout session not available"));
      return;
    }

    try {
      const startOptions: PayPalGuestPresentationModeOptions = {
        presentationMode: "auto",
        fullPageOverlay,
        ...(buttonRef.current
          ? { targetElement: buttonRef.current as EventTarget }
          : {}),
      };
      await sessionRef.current.start(startOptions, createOrder?.());
    } catch (err) {
      if (isMountedRef.current) {
        setError(err);
      }
    }
  }, [isMountedRef, fullPageOverlay, createOrder, setError]);

  return {
    buttonRef,
    error,
    isPending,
    handleClick,
    handleCancel,
    handleDestroy,
  };
}
