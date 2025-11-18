import { useCallback, useEffect, useRef } from "react";

import { usePayPal } from "./usePayPal";
import { useIsMountedRef } from "./useIsMounted";
import { useError } from "./useError";
import { useProxyProps } from "../utils";
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

export function usePayPalOneTimePaymentSession({
    presentationMode,
    fullPageOverlay,
    autoRedirect,
    createOrder,
    orderId,
    ...callbacks
}: UsePayPalOneTimePaymentSessionProps): BasePaymentSessionReturn {
    const { sdkInstance } = usePayPal();
    const isMountedRef = useIsMountedRef();
    const sessionRef = useRef<OneTimePaymentSession | null>(null);
    const proxyCallbacks = useProxyProps(callbacks);
    const [error, setError] = useError();

    const handleDestroy = useCallback(() => {
        sessionRef.current?.destroy();
        sessionRef.current = null;
    }, []);

    const handleCancel = useCallback(() => {
        sessionRef.current?.cancel();
    }, []);

    // Separate error reporting effect to avoid infinite loops with proxyCallbacks
    useEffect(() => {
        if (!sdkInstance) {
            setError(new Error("no sdk instance available"));
        }
    }, [sdkInstance, setError]);

    useEffect(() => {
        if (!sdkInstance) {
            return;
        }

        const newSession = sdkInstance.createPayPalOneTimePaymentSession({
            orderId,
            ...proxyCallbacks,
        });

        sessionRef.current = newSession;

        return handleDestroy;
    }, [sdkInstance, orderId, proxyCallbacks, handleDestroy]);

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

        if (createOrder) {
            await sessionRef.current.start(startOptions, createOrder());
        } else {
            await sessionRef.current.start(startOptions);
        }
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
        handleClick,
        handleCancel,
        handleDestroy,
    };
}
