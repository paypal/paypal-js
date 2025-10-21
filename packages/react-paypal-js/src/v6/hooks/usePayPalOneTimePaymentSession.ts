import { useCallback, useEffect, useRef } from "react";

import { usePayPal } from "./usePayPal";
import { useProxyProps } from "../utils";
import {
    OneTimePaymentSession,
    PayPalPresentationModeOptions,
    UsePayPalOneTimePaymentSessionProps,
    UsePayPalOneTimePaymentSessionReturn,
} from "../types";

export function usePayPalOneTimePaymentSession({
    presentationMode,
    createOrder,
    orderId,
    ...callbacks
}: UsePayPalOneTimePaymentSessionProps): UsePayPalOneTimePaymentSessionReturn | null {
    const { sdkInstance } = usePayPal();
    const sessionRef = useRef<OneTimePaymentSession | null>(null);
    const proxyCallbacks = useProxyProps(callbacks);

    const handleDestroy = useCallback(() => {
        sessionRef.current?.destroy();
        sessionRef.current = null;
    }, []);

    const handleCancel = useCallback(() => {
        sessionRef.current?.cancel();
    }, []);

    useEffect(() => {
        if (!sdkInstance) {
            throw new Error("no sdk instance available");
        }

        const newSession = sdkInstance.createPayPalOneTimePaymentSession({
            orderId,
            ...proxyCallbacks,
        });

        sessionRef.current = newSession;

        return handleDestroy;
    }, [sdkInstance, orderId, proxyCallbacks, handleDestroy]);

    const handleClick = useCallback(async () => {
        if (!sessionRef.current) {
            throw new Error("PayPal session not available");
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
        handleClick,
        handleCancel,
        handleDestroy,
    };
}
