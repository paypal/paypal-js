import { useCallback, useEffect, useRef } from "react";

import { usePayPal } from "./usePayPal";
import { useIsMountedRef } from "./useIsMounted";
import { useError } from "./useError";
import { useProxyProps } from "../utils";
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
    PayPalGuestPresentationModeHookOptions;

/**
 * `usePayPalGuestPaymentSession` is used to interface with a guest checkout session. Guest checkout
 * sessions require a `<paypal-basic-card-button>` to target for displaying the guest checkout form.
 *
 * @example
 * const { buttonRef, error, handleClick } = usePayPalGuestPaymentSession({ ...arguments });
 *
 * return (
 *   <paypal-basic-card-button
 *     onClick={handleClick}
 *     ref={buttonRef}
 *     {...otherProps}>
 *   </paypal-basic-card-button>
 * )
 *
 */
export function usePayPalGuestPaymentSession({
    fullPageOverlay,
    createOrder,
    orderId,
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

    // Track if we encountered a creation error to prevent infinite retry loops
    const creationErrorRef = useRef(false);
    // Track SDK instance changes to reset error state
    const lastSdkInstanceRef = useRef(sdkInstance);

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
        // Reset error tracking when SDK instance changes
        if (lastSdkInstanceRef.current !== sdkInstance) {
            creationErrorRef.current = false;
            lastSdkInstanceRef.current = sdkInstance;
        }

        if (sdkInstance) {
            setError(null);
        } else if (loadingStatus !== INSTANCE_LOADING_STATE.PENDING) {
            setError(new Error("no sdk instance available"));
        }
    }, [sdkInstance, setError, loadingStatus]);

    // Create and manage session lifecycle
    useEffect(() => {
        if (!sdkInstance) {
            return;
        }

        if (creationErrorRef.current) {
            return;
        }

        try {
            const newSession =
                sdkInstance.createPayPalGuestOneTimePaymentSession({
                    orderId,
                    ...proxyCallbacks,
                    ...(onShippingAddressChange && { onShippingAddressChange }),
                    ...(onShippingOptionsChange && { onShippingOptionsChange }),
                });
            sessionRef.current = newSession;
        } catch (err) {
            creationErrorRef.current = true;

            const detailedError = new Error(
                "Failed to create PayPal guest one-time payment session. " +
                    "This may occur if the required components are not included in the SDK components array. " +
                    "Please ensure you have added the necessary components when loading the PayPal SDK. " +
                    `Original error: ${err instanceof Error ? err.message : String(err)}`,
            );
            setError(detailedError);
            return;
        }

        return () => {
            sessionRef.current?.destroy();
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
