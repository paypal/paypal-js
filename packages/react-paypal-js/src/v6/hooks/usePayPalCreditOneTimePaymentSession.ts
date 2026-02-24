import { useCallback, useEffect, useRef } from "react";

import { usePayPal } from "./usePayPal";
import { useIsMountedRef } from "./useIsMounted";
import { useError } from "./useError";
import { useProxyProps, createPaymentSession } from "../utils";
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
 *
 * @example
 * const { error, handleClick, handleCancel, handleDestroy } = usePayPalCreditOneTimePaymentSession({
 *   presentationMode: 'popup',
 *   createOrder: async () => ({ orderId: 'ORDER-123' }),
 *   onApprove: (data) => console.log('Approved:', data),
 *   onCancel: () => console.log('Cancelled'),
 * });
 * const { eligiblePaymentMethods } = usePayPal();
 * const countryCode = eligiblePaymentMethods.eligible_methods.paypal_credit.country_code;
 *
 * return (
 *   <paypal-credit-button countryCode={countryCode} onClick={handleClick}></paypal-credit-button>
 * )
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
                sdkInstance.createPayPalCreditOneTimePaymentSession({
                    orderId,
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
    }, [sdkInstance, orderId, proxyCallbacks, presentationMode, setError]);

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
