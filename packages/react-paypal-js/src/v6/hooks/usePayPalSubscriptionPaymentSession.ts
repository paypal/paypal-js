import { useCallback, useEffect, useRef } from "react";

import { usePayPal } from "./usePayPal";
import { useIsMountedRef } from "./useIsMounted";
import { useProxyProps, createPaymentSession } from "../utils";
import { useError } from "./useError";
import { INSTANCE_LOADING_STATE } from "../types/PayPalProviderEnums";

import type {
    BasePaymentSessionReturn,
    PayPalSubscriptionPresentationModeOptions,
    PayPalSubscriptionPaymentSession,
    PayPalSubscriptionSessionOptions,
} from "../types";

export type UsePayPalSubscriptionPaymentSessionProps =
    PayPalSubscriptionSessionOptions &
        PayPalSubscriptionPresentationModeOptions & {
            createSubscription: () => Promise<{ subscriptionId: string }>;
        };

/**
 * Hook for managing PayPal subscription payment sessions.
 *
 * This hook creates and manages a PayPal subscription payment session, supporting multiple presentation modes
 * including popup and modal. It handles session lifecycle and provides methods to start, cancel, and destroy the session.
 *
 * @param props - Configuration options including presentation mode and callbacks
 * @param props.createSubscription - Function that returns a promise resolving to an object with subscriptionId
 * @param props.presentationMode - How the subscription experience is presented: 'popup', 'modal', 'auto', or 'payment-handler'
 * @param props.fullPageOverlay - Whether to show a full-page overlay during the subscription flow
 * @returns Object with: `error` (any session error), `handleClick` (starts session), `handleCancel` (cancels session), `handleDestroy` (cleanup)
 *
 * @example
 * const { error, handleClick, handleCancel, handleDestroy } = usePayPalSubscriptionPaymentSession({
 *   presentationMode: 'popup',
 *   createSubscription: async () => ({ subscriptionId: 'SUB-123' }),
 *   onApprove: (data) => console.log('Subscription approved:', data),
 *   onCancel: () => console.log('Subscription cancelled'),
 *   onError: (err) => console.error('Subscription error:', err),
 * });
 */
export function usePayPalSubscriptionPaymentSession({
    presentationMode,
    fullPageOverlay,
    createSubscription,
    ...callbacks
}: UsePayPalSubscriptionPaymentSessionProps): BasePaymentSessionReturn {
    const { sdkInstance, loadingStatus } = usePayPal();
    const isMountedRef = useIsMountedRef();
    const sessionRef = useRef<PayPalSubscriptionPaymentSession | null>(null);
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
                sdkInstance.createPayPalSubscriptionPaymentSession({
                    ...proxyCallbacks,
                }),
            failedSdkRef,
            sdkInstance,
            setError,
        );

        if (!newSession) {
            return;
        }

        sessionRef.current = newSession;

        return () => {
            newSession.destroy();
        };
    }, [sdkInstance, proxyCallbacks, setError]);

    const handleClick = useCallback(async () => {
        if (!isMountedRef.current) {
            return;
        }

        if (!sessionRef.current) {
            setError(new Error("PayPal subscription session not available"));
            return;
        }

        const startOptions = {
            presentationMode,
            fullPageOverlay,
        } as PayPalSubscriptionPresentationModeOptions;

        const result = await sessionRef.current.start(
            startOptions,
            createSubscription(),
        );
        return result;
    }, [
        isMountedRef,
        presentationMode,
        fullPageOverlay,
        createSubscription,
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
