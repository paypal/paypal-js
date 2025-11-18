import { useCallback, useEffect, useRef } from "react";

import { usePayPal } from "./usePayPal";
import { useIsMountedRef } from "./useIsMounted";
import { useError } from "./useError";
import { useProxyProps } from "../utils";

import type {
    BasePaymentSessionReturn,
    CreateOrderCallback,
    OneTimePaymentSession,
    PayLaterOneTimePaymentSessionOptions,
    PayPalPresentationModeOptions,
} from "../types";

export type PayLaterOneTimePaymentSessionProps = (
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

export function usePayLaterOneTimePaymentSession({
    presentationMode,
    fullPageOverlay,
    autoRedirect,
    createOrder,
    orderId,
    ...callbacks
}: PayLaterOneTimePaymentSessionProps): BasePaymentSessionReturn {
    const { sdkInstance } = usePayPal();
    const isMountedRef = useIsMountedRef();
    const sessionRef = useRef<OneTimePaymentSession | null>(null); // handle cleanup
    const proxyCallbacks = useProxyProps(callbacks);
    const [error, setError] = useError();

    const handleDestroy = useCallback(() => {
        sessionRef.current?.destroy();
        sessionRef.current = null;
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

        const newSession = sdkInstance.createPayLaterOneTimePaymentSession({
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
            setError(new Error("PayLater session not available"));
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
        createOrder,
        presentationMode,
        fullPageOverlay,
        autoRedirect,
        isMountedRef,
        setError,
    ]);

    return {
        error,
        handleCancel,
        handleClick,
        handleDestroy,
    };
}
