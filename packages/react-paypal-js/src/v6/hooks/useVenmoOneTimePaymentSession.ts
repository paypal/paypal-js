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

    // Track if we encountered a creation error to prevent infinite retry loops
    const creationErrorRef = useRef(false);
    // Track SDK instance changes to reset error state
    const lastSdkInstanceRef = useRef(sdkInstance);

    const isPending = loadingStatus === INSTANCE_LOADING_STATE.PENDING;

    const handleDestroy = useCallback(() => {
        sessionRef.current?.destroy();
        sessionRef.current = null;
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
            const newSession = sdkInstance.createVenmoOneTimePaymentSession({
                orderId,
                ...proxyCallbacks,
            });
            sessionRef.current = newSession;
        } catch (err) {
            creationErrorRef.current = true;

            const detailedError = new Error(
                "Failed to create Venmo one-time payment session. " +
                    "This may occur if the required components are not included in the SDK components array. " +
                    "Please ensure you have added the necessary components when loading the PayPal SDK. " +
                    `Original error: ${err instanceof Error ? err.message : String(err)}`,
            );
            setError(detailedError);
            return;
        }

        return handleDestroy;
    }, [sdkInstance, orderId, proxyCallbacks, handleDestroy, setError]);

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
