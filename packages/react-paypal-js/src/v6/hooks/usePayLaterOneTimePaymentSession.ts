import { useCallback, useEffect, useRef } from "react";

import { usePayPal } from "./usePayPal";
import { useIsMountedRef } from "./useIsMounted";
import { useError } from "./useError";
import { useProxyProps } from "../utils";
import { INSTANCE_LOADING_STATE } from "../types/PayPalProviderEnums";

import type {
    BasePaymentSessionReturn,
    CreateOrderCallback,
    OneTimePaymentSession,
    PayLaterOneTimePaymentSessionOptions,
    PayPalPresentationModeOptions,
} from "../types";

export type UsePayLaterOneTimePaymentSessionProps = (
    | (Omit<PayLaterOneTimePaymentSessionOptions, "orderId"> & {
          createOrder: CreateOrderCallback;
          orderId?: never;
      })
    | (PayLaterOneTimePaymentSessionOptions & {
          createOrder?: never;
          orderId: string;
      })
) &
    PayPalPresentationModeOptions;

/**
 * Hook for managing Pay Later one-time payment sessions.
 *
 * This hook creates and manages a Pay Later payment session. It handles session lifecycle, resume flows
 * for redirect-based presentation modes (`"redirect"` and `"direct-app-switch"`), and provides methods
 * to start, cancel, and destroy the session.
 *
 * @returns Object with: `error` (any session error), `isPending` (SDK loading), `handleClick` (starts session), `handleCancel` (cancels session), `handleDestroy` (cleanup)
 *
 * @example
 * function PayLaterCheckout() {
 *   const { error, isPending, handleClick, handleCancel } = usePayLaterOneTimePaymentSession({
 *     presentationMode: 'popup',
 *     createOrder: async () => ({ orderId: 'ORDER-123' }),
 *     onApprove: (data) => console.log('Approved:', data),
 *     onCancel: () => console.log('Cancelled'),
 *   });
 *   const { eligiblePaymentMethods } = usePayPal();
 *   const payLaterDetails = eligiblePaymentMethods?.getDetails?.("paylater");
 *
 *   if (isPending) return null;
 *   if (error) return <div>Error: {error.message}</div>;
 *
 *   return (
 *     <paypal-pay-later-button
 *       countryCode={payLaterDetails?.countryCode}
 *       productCode={payLaterDetails?.productCode}
 *       onClick={handleClick}
 *       onCancel={handleCancel}
 *     />
 *   );
 * }
 */
export function usePayLaterOneTimePaymentSession({
    presentationMode,
    fullPageOverlay,
    autoRedirect,
    createOrder,
    orderId,
    ...callbacks
}: UsePayLaterOneTimePaymentSessionProps): BasePaymentSessionReturn {
    const { sdkInstance, loadingStatus } = usePayPal();
    const isMountedRef = useIsMountedRef();
    const sessionRef = useRef<OneTimePaymentSession | null>(null);
    const proxyCallbacks = useProxyProps(callbacks);
    const [error, setError] = useError();
    const isPending = loadingStatus === INSTANCE_LOADING_STATE.PENDING;

    const handleDestroy = useCallback(() => {
        sessionRef.current?.destroy();
        sessionRef.current = null;
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

        const newSession = sdkInstance.createPayLaterOneTimePaymentSession({
            orderId,
            ...proxyCallbacks,
        });
        sessionRef.current = newSession;

        // check for resume flow in redirect-based presentation modes
        const isRedirectMode =
            presentationMode === "redirect" ||
            presentationMode === "direct-app-switch";

        if (isRedirectMode) {
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

        return handleDestroy;
    }, [
        sdkInstance,
        orderId,
        proxyCallbacks,
        handleDestroy,
        presentationMode,
        setError,
    ]);

    const handleCancel = useCallback(() => {
        sessionRef.current?.cancel();
    }, []);

    const handleClick = useCallback(async () => {
        if (!isMountedRef.current) {
            return;
        }

        if (!sessionRef.current) {
            setError(new Error("PayLater session not available"));
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
        createOrder,
        presentationMode,
        fullPageOverlay,
        autoRedirect,
        isMountedRef,
        setError,
    ]);

    return {
        error,
        isPending,
        handleCancel,
        handleClick,
        handleDestroy,
    };
}
