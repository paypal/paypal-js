import { useCallback, useEffect, useRef } from "react";

import { usePayPal } from "./usePayPal";
import { useIsMountedRef } from "./useIsMounted";
import { useError } from "./useError";
import { useProxyProps } from "../utils";
import { INSTANCE_LOADING_STATE } from "../types/PayPalProviderEnums";

import type {
    VenmoOneTimePaymentSession,
    VenmoPresentationModeOptions,
    VenmoOneTimePaymentSessionOptions,
    VenmoOneTimePaymentSessionPromise,
    BasePaymentSessionReturn,
} from "../types";

export type UseVenmoOneTimePaymentSessionProps = (
    | (Omit<VenmoOneTimePaymentSessionOptions, "orderId"> & {
          createOrder: () => VenmoOneTimePaymentSessionPromise;
          orderId?: never;
      })
    | (VenmoOneTimePaymentSessionOptions & {
          createOrder?: never;
          orderId: string;
      })
) &
    VenmoPresentationModeOptions;

/**
 * Hook for managing Venmo one-time payment sessions.
 *
 * This hook creates and manages a Venmo payment session. It handles session lifecycle
 * and provides methods to start, cancel, and destroy the session.
 *
 * @returns Object with: `error` (any session error), `isPending` (SDK loading), `handleClick` (starts session), `handleCancel` (cancels session), `handleDestroy` (cleanup)
 *
 * @example
 * function VenmoCheckout() {
 *   const { error, isPending, handleClick, handleCancel } = useVenmoOneTimePaymentSession({
 *     presentationMode: 'auto',
 *     createOrder: async () => ({ orderId: 'ORDER-123' }),
 *     onApprove: (data) => console.log('Approved:', data),
 *     onCancel: () => console.log('Cancelled'),
 *   });
 *
 *   if (isPending) return null;
 *   if (error) return <div>Error: {error.message}</div>;
 *
 *   return (
 *     <venmo-button onClick={handleClick} onCancel={handleCancel} />
 *   );
 * }
 */
export function useVenmoOneTimePaymentSession({
    presentationMode,
    fullPageOverlay,
    createOrder,
    orderId,
    ...callbacks
}: UseVenmoOneTimePaymentSessionProps): BasePaymentSessionReturn {
    const { sdkInstance, loadingStatus } = usePayPal();
    const isMountedRef = useIsMountedRef();
    const sessionRef = useRef<VenmoOneTimePaymentSession | null>(null);
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

        const newSession = sdkInstance.createVenmoOneTimePaymentSession({
            orderId,
            ...proxyCallbacks,
        });
        sessionRef.current = newSession;

        return handleDestroy;
    }, [sdkInstance, orderId, proxyCallbacks, handleDestroy]);

    const handleCancel = useCallback(() => {
        sessionRef.current?.cancel();
    }, []);

    const handleClick = useCallback(async () => {
        if (!isMountedRef.current) {
            return;
        }

        if (!sessionRef.current) {
            setError(new Error("Venmo session not available"));
            return;
        }

        const startOptions = {
            presentationMode,
            fullPageOverlay,
        } as VenmoPresentationModeOptions;

        await sessionRef.current.start(startOptions, createOrder?.());
    }, [
        isMountedRef,
        presentationMode,
        fullPageOverlay,
        createOrder,
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
