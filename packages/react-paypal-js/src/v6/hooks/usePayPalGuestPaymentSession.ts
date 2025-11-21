import { useCallback, useEffect, useRef, useState } from "react";

import { usePayPal } from "./usePayPal";
import { useIsMountedRef } from "./useIsMounted";
import { useError } from "./useError";
import { useProxyProps } from "../utils";

import type {
    PayPalGuestOneTimePaymentSession,
    PayPalGuestOneTimePaymentSessionOptions,
    PayPalGuestOneTimePaymentSessionPromise,
    PayPalGuestPresentationModeOptions,
} from "@paypal/paypal-js/sdk-v6";
import type { BasePaymentSessionReturn } from "../types";

export type UsePayPalGuestPaymentSessionProps = (
    | (Omit<PayPalGuestOneTimePaymentSessionOptions, "orderId"> & {
          createOrder: () => PayPalGuestOneTimePaymentSessionPromise;
          orderId?: never;
      })
    | (PayPalGuestOneTimePaymentSessionOptions & {
          createOrder?: never;
          orderId: string;
      })
) & {
    buyerCountry?: string;
    targetElement?: string | HTMLElement;
    presentationMode?: "auto";
    fullPageOverlay?: boolean;
    autoRedirect?: boolean;
};

export function usePayPalGuestPaymentSession({
    presentationMode = "auto",
    fullPageOverlay,
    createOrder,
    orderId,
    targetElement,
    ...callbacks
}: UsePayPalGuestPaymentSessionProps): BasePaymentSessionReturn {
    const { sdkInstance } = usePayPal();
    const isMountedRef = useIsMountedRef();
    const sessionRef = useRef<PayPalGuestOneTimePaymentSession | null>(null);
    const buttonRef = useRef<HTMLElement>(null);
    const proxyCallbacks = useProxyProps(callbacks);
    const [error, setError] = useError();
    const [isProcessing, setIsProcessing] = useState(false);
    const isSessionActiveRef = useRef(false);

    // Track whether shipping callbacks are present to trigger session recreation
    const hasShippingCallbacks = Boolean(
        (callbacks as Record<string, unknown>).onShippingAddressChange ||
            (callbacks as Record<string, unknown>).onShippingOptionsChange,
    );

    const handleDestroy = useCallback(() => {
        sessionRef.current?.destroy();
        sessionRef.current = null;
        isSessionActiveRef.current = false;
        setIsProcessing(false);
    }, []);

    useEffect(() => {
        if (!sdkInstance) {
            setError(new Error("no sdk instance available"));
        }
    }, [sdkInstance, setError]);

    useEffect(() => {
        if (!sdkInstance) {
            return;
        }

        // Resets the button state to allow it to be clicked again after payment flow complete/cancels.
        const resetState = () => {
            if (isMountedRef.current) {
                isSessionActiveRef.current = false;
                setIsProcessing(false);
            }
        };

        // Wraps a callback function to automatically reset button state after completion.
        const wrapWithReset = <
            T extends (...args: never[]) => Promise<void> | void,
        >(
            callback?: T,
        ) => {
            if (!callback) {
                return callback;
            }

            return async (...args: Parameters<T>) => {
                try {
                    await callback(...args);
                } finally {
                    resetState();
                }
            };
        };

        // Creating session callbacks with wrapped versions to reset state.
        const sessionCallbacks = {
            ...proxyCallbacks,
            onApprove: wrapWithReset(proxyCallbacks.onApprove),
            onCancel: wrapWithReset(proxyCallbacks.onCancel),
            onError: wrapWithReset(proxyCallbacks.onError),
        } as typeof proxyCallbacks;

        const newSession = sdkInstance.createPayPalGuestOneTimePaymentSession({
            orderId,
            ...sessionCallbacks,
        });
        sessionRef.current = newSession;

        return () => {
            newSession.destroy();
            resetState();
        };
    }, [
        sdkInstance,
        orderId,
        proxyCallbacks,
        hasShippingCallbacks,
        isMountedRef,
    ]);

    const handleCancel = useCallback(() => {
        sessionRef.current?.cancel();
        isSessionActiveRef.current = false;
        setIsProcessing(false);
    }, []);

    const handleClick = useCallback(async () => {
        if (!isMountedRef.current) {
            return;
        }
        if (!sessionRef.current) {
            setError(new Error("PayPal Guest Checkout session not available"));
            return;
        }

        if (isSessionActiveRef.current) {
            return;
        }

        setIsProcessing(true);
        isSessionActiveRef.current = true;

        try {
            const target = targetElement || buttonRef.current;
            const startOptions: PayPalGuestPresentationModeOptions = {
                presentationMode,
                ...(fullPageOverlay !== undefined && {
                    fullPageOverlay: { enabled: fullPageOverlay },
                }),
                ...(target ? { targetElement: target as EventTarget } : {}),
            };
            const checkoutOptionsPromise = createOrder
                ? createOrder()
                : undefined;
            await sessionRef.current.start(
                startOptions,
                checkoutOptionsPromise,
            );

            // If session.start() completes without error, it means:
            // - For inline: form opened successfully (callbacks will handle reset)
            // - For popup/modal: window closed without completing (need to reset here)
            // We reset here to handle popup/modal closure, but wrapped callbacks
            // will also reset, which is safe (idempotent operation)
            if (isMountedRef.current) {
                isSessionActiveRef.current = false;
                setIsProcessing(false);
            }
        } catch (err) {
            if (isMountedRef.current) {
                isSessionActiveRef.current = false;
                setIsProcessing(false);
                setError(err instanceof Error ? err : new Error(String(err)));
            }
        }
    }, [
        isMountedRef,
        presentationMode,
        fullPageOverlay,
        createOrder,
        targetElement,
        setError,
    ]);

    return {
        buttonRef,
        error,
        handleCancel,
        handleClick,
        handleDestroy,
        isProcessing,
    };
}
