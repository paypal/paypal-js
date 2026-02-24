import { useCallback, useEffect, useRef } from "react";

import { usePayPal } from "./usePayPal";
import { useIsMountedRef } from "./useIsMounted";
import { useError } from "./useError";
import { useProxyProps, createPaymentSession } from "../utils";
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

    // Prevents retrying session creation with a failed SDK instance
    const failedSdkRef = useRef<unknown>(null);

    const isPending = loadingStatus === INSTANCE_LOADING_STATE.PENDING;

    const handleDestroy = useCallback(() => {
        sessionRef.current?.destroy();
        sessionRef.current = null;
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
                sdkInstance.createVenmoOneTimePaymentSession({
                    orderId,
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
    }, [sdkInstance, orderId, proxyCallbacks, setError]);

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
