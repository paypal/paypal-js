import { useCallback, useEffect, useRef } from "react";

import { usePayPal } from "./usePayPal";
import { useIsMountedRef } from "./useIsMounted";
import { useError } from "./useError";
import { useProxyProps, createPaymentSession } from "../utils";
import { INSTANCE_LOADING_STATE } from "../types/PayPalProviderEnums";
import {
    OneTimePaymentSession,
    PayPalPresentationModeOptions,
    PayPalOneTimePaymentSessionOptions,
    BasePaymentSessionReturn,
} from "../types";

export type UsePayPalOneTimePaymentSessionProps = (
    | (Omit<PayPalOneTimePaymentSessionOptions, "orderId"> & {
          createOrder: () => Promise<{ orderId: string }>;
          orderId?: never;
      })
    | (PayPalOneTimePaymentSessionOptions & {
          createOrder?: never;
          orderId: string;
      })
) &
    PayPalPresentationModeOptions;

/**
 * Hook for managing one-time payment sessions with PayPal.
 *
 * The hook returns an `isPending` flag that indicates whether the SDK instance is still being
 * initialized. This is useful when using deferred clientToken loading - buttons should wait
 * to render until `isPending` is false.
 *
 * @returns Object with: `error` (any session error), `isPending` (SDK loading), `handleClick` (starts session), `handleCancel` (cancels session), `handleDestroy` (cleanup)
 *
 * @example
 * function PayPalCheckout() {
 *   const { isPending, error, handleClick, handleCancel } = usePayPalOneTimePaymentSession({
 *     orderId: "ORDER-123",
 *     presentationMode: "auto",
 *     onApprove: (data) => console.log("Approved:", data),
 *   });
 *
 *   if (isPending) return null;
 *   if (error) return <div>Error: {error.message}</div>;
 *
 *   return (
 *     <paypal-button onClick={handleClick} onCancel={handleCancel} />
 *   );
 * }
 */
export function usePayPalOneTimePaymentSession({
    presentationMode,
    fullPageOverlay,
    autoRedirect,
    createOrder,
    orderId,
    savePayment,
    testBuyerCountry,
    ...callbacks
}: UsePayPalOneTimePaymentSessionProps): BasePaymentSessionReturn {
    const { sdkInstance, loadingStatus } = usePayPal();
    const isMountedRef = useIsMountedRef();
    const sessionRef = useRef<OneTimePaymentSession | null>(null);
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

    // Create and manage session lifecycle
    useEffect(() => {
        if (!sdkInstance) {
            return;
        }

        const newSession = createPaymentSession(
            () =>
                sdkInstance.createPayPalOneTimePaymentSession({
                    orderId,
                    savePayment,
                    testBuyerCountry,
                    ...proxyCallbacks,
                }),
            failedSdkRef,
            sdkInstance,
            setError,
            "paypal-payments",
        );

        if (!newSession) {
            return;
        }

        sessionRef.current = newSession;

        // Only check for resume flow in redirect-based presentation modes
        const shouldCheckResume =
            presentationMode === "redirect" ||
            presentationMode === "direct-app-switch";

        if (shouldCheckResume) {
            const handleReturnFromPayPal = async () => {
                try {
                    if (!newSession) {
                        return;
                    }
                    const isResumeFlow = newSession.hasReturned?.();
                    if (isResumeFlow) {
                        await newSession.resume?.();
                    }
                } catch (err) {
                    setError(err as Error);
                }
            };

            handleReturnFromPayPal();
        }

        return () => {
            newSession.destroy();
        };
    }, [
        sdkInstance,
        orderId,
        proxyCallbacks,
        presentationMode,
        setError,
        savePayment,
        testBuyerCountry,
    ]);

    const handleClick = useCallback(async () => {
        if (!isMountedRef.current) {
            return;
        }

        if (!sessionRef.current) {
            setError(new Error("PayPal session not available"));
            return;
        }

        const startOptions = {
            presentationMode,
            fullPageOverlay,
            autoRedirect,
        } as PayPalPresentationModeOptions;

        const result = await sessionRef.current.start(
            startOptions,
            createOrder?.(),
        );
        return result;
    }, [
        isMountedRef,
        presentationMode,
        fullPageOverlay,
        autoRedirect,
        createOrder,
        setError,
    ]);

    return {
        error,
        isPending,
        handleClick,
        handleCancel,
        handleDestroy,
    };
}
