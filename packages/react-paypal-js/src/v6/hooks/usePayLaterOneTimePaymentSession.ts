import { useCallback, useEffect, useRef, useState } from "react";

import { usePayPal } from "./usePayPal";
import { useProxyProps } from "../utils";

import type {
    OneTimePaymentSession,
    PayPalPresentationModeOptions,
    PayLaterOneTimePaymentSessionProps,
    PayLaterOneTimePaymentSessionReturn,
} from "../types";

export function usePayLaterOneTimePaymentSession({
    presentationMode,
    createOrder,
    orderId,
    ...callbacks
}: PayLaterOneTimePaymentSessionProps): PayLaterOneTimePaymentSessionReturn {
    const { sdkInstance } = usePayPal();
    const sessionRef = useRef<OneTimePaymentSession | null>(null); // handle cleanup
    const proxyCallbacks = useProxyProps(callbacks);
    const [error, setError] = useState<Error | null>(null);

    const handleDestroy = useCallback(() => {
        sessionRef.current?.destroy();
        sessionRef.current = null;
    }, []);

    // Separate error reporting effect to avoid infinite loops with proxyCallbacks
    useEffect(() => {
        if (!sdkInstance) {
            setError(new Error("no sdk instance available"));
        }
    }, [sdkInstance]);

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
        if (!sessionRef.current) {
            setError(new Error("paylater session not available"));
            return;
        }

        const startOptions: PayPalPresentationModeOptions = {
            presentationMode,
        };

        if (createOrder) {
            await sessionRef.current.start(startOptions, createOrder());
        } else {
            await sessionRef.current.start(startOptions);
        }
    }, [createOrder, presentationMode]);

    return {
        error,
        handleCancel,
        handleClick,
        handleDestroy,
    };
}
