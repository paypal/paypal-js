import { useCallback, useEffect, useRef } from "react";

import { usePayPal } from "./usePayPal";
import { useIsMountedRef } from "./useIsMounted";
import { useError } from "./useError";
import { useProxyProps } from "../utils";
import { INSTANCE_LOADING_STATE } from "../types/PayPalProviderEnums";

import type {
    BasePaymentSessionReturn,
    OneTimePaymentSession,
    PayPalPresentationModeOptions,
    PayPalCreditOneTimePaymentSessionOptions,
} from "../types";

export type UsePayPalCreditOneTimePaymentSessionProps = (
    | (Omit<PayPalCreditOneTimePaymentSessionOptions, "orderId"> & {
          createOrder: () => Promise<{ orderId: string }>;
          orderId?: never;
      })
    | (PayPalCreditOneTimePaymentSessionOptions & {
          createOrder?: never;
          orderId: string;
      })
) &
    PayPalPresentationModeOptions;

/**
 * Hook for managing PayPal Credit one-time payment sessions.
 *
 * This hook creates and manages a PayPal Credit payment session. It handles session lifecycle, resume flows
 * for redirect-based flows, and provides methods to start, cancel, and destroy the session.
 *
 * @returns Object with: `error` (any session error), `isPending` (SDK loading), `handleClick` (starts session), `handleCancel` (cancels session), `handleDestroy` (cleanup)
 *
 * @example
 * function CreditCheckout() {
 *   const { error, isPending, handleClick, handleCancel, handleDestroy } = usePayPalCreditOneTimePaymentSession({
 *     presentationMode: 'popup',
 *     createOrder: async () => ({ orderId: 'ORDER-123' }),
 *     onApprove: (data) => console.log('Approved:', data),
 *     onCancel: () => console.log('Cancelled'),
 *   });
 *   const { eligiblePaymentMethods } = usePayPal();
 *   const creditDetails = eligiblePaymentMethods?.getDetails?.("paypal_credit");
 *
 *   useEffect(() => { return () => handleDestroy(); }, [handleDestroy]);
 *
 *   if (isPending) return null;
 *   if (error) return <div>Error: {error.message}</div>;
 *
 *   return (
 *     <paypal-credit-button
 *       countryCode={creditDetails?.countryCode}
 *       onClick={handleClick}
 *       onCancel={handleCancel}
 *     />
 *   );
 * }
 */
export function usePayPalCreditOneTimePaymentSession({
    presentationMode,
    fullPageOverlay,
    autoRedirect,
    createOrder,
    orderId,
    ...callbacks
}: UsePayPalCreditOneTimePaymentSessionProps): BasePaymentSessionReturn {
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

        // Create session (can be created without orderId for resume detection)
        const newSession = sdkInstance.createPayPalCreditOneTimePaymentSession({
            orderId,
            ...proxyCallbacks,
        });

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

        return handleDestroy;
    }, [
        sdkInstance,
        orderId,
        proxyCallbacks,
        handleDestroy,
        presentationMode,
        setError,
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
        handleDestroy,
        handleCancel,
    };
}
