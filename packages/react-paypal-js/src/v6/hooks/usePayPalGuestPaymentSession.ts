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

    const handleDestroy = useCallback(() => {
        sessionRef.current?.destroy();
        sessionRef.current = null;
    }, []);

    const handleCancel = useCallback(() => {
        sessionRef.current?.cancel();
    }, []);

    // Separate error reporting effect to avoid infinite loops with proxyCallbacks
    useEffect(() => {
        if (sdkInstance) {
            setError(null);
        } else if (loadingStatus !== INSTANCE_LOADING_STATE.PENDING) {
            setError(new Error("no sdk instance available"));
        }
    }, [sdkInstance, setError, loadingStatus]);

    useEffect(() => {
        if (!sdkInstance) {
            return;
        }

        const newSession = sdkInstance.createPayPalGuestOneTimePaymentSession({
            orderId,
            ...proxyCallbacks,
            ...(onShippingAddressChange && { onShippingAddressChange }),
            ...(onShippingOptionsChange && { onShippingOptionsChange }),
        });
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
        handleClick,
        handleCancel,
        handleDestroy,
    };
}
