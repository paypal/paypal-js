import { useEffect, useCallback, useRef } from "react";

import { usePayPal } from "./usePayPal";
import { useProxyProps } from "../utils";

import type {
    VenmoOneTimePaymentSession,
    VenmoPresentationModeOptions,
    UseVenmoOneTimePaymentSessionProps,
    UseVenmoOneTimePaymentSessionReturn,
} from "../types";

export function useVenmoOneTimePaymentSession({
    presentationMode,
    createOrder,
    orderId,
    ...callbacks
}: UseVenmoOneTimePaymentSessionProps): UseVenmoOneTimePaymentSessionReturn {
    const { sdkInstance } = usePayPal();
    const sessionRef = useRef<VenmoOneTimePaymentSession | null>(null);
    const proxyCallbacks = useProxyProps(callbacks);

    const handleDestroy = useCallback(() => {
        sessionRef.current?.destroy();
        sessionRef.current = null;
    }, []);

    useEffect(() => {
        if (!sdkInstance) {
            throw new Error("no sdk instance available");
        }

        const newSession = sdkInstance.createVenmoOneTimePaymentSession({
            orderId,
            ...proxyCallbacks,
        });
        sessionRef.current = newSession;

        return handleDestroy;
    }, [sdkInstance, orderId, proxyCallbacks, handleDestroy]);

    const handleClick = useCallback(async () => {
        if (!sessionRef.current) {
            throw new Error("Venmo session not available");
        }

        const startOptions: VenmoPresentationModeOptions = {
            presentationMode,
        };

        if (createOrder) {
            await sessionRef.current.start(startOptions, createOrder());
        } else {
            await sessionRef.current.start(startOptions);
        }
    }, [createOrder, presentationMode]);

    const handleCancel = useCallback(() => {
        sessionRef.current?.cancel();
    }, []);

    return {
        handleClick,
        handleCancel,
        handleDestroy,
    };
}
