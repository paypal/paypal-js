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
            // Create session (can be created without orderId for resume detection)
            const newSession =
                sdkInstance.createPayPalCreditOneTimePaymentSession({
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
        } catch (err) {
            creationErrorRef.current = true;

            const detailedError = new Error(
                "Failed to create PayPal Credit one-time payment session. " +
                    "This may occur if the required components are not included in the SDK components array. " +
                    "Please ensure you have added the necessary components when loading the PayPal SDK. " +
                    `Original error: ${err instanceof Error ? err.message : String(err)}`,
            );
            setError(detailedError);
            return;
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
