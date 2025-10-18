import { useEffect, useCallback, useRef } from "react";

import { usePayPal } from "./usePayPal";
import { useProxyProps } from "../utils";

import type {
    VenmoOneTimePaymentSession,
    VenmoPresentationModeOptions,
} from "../types";
import type {
    UseVenmoOneTimePaymentSessionProps,
    UseVenmoOneTimePaymentSessionReturn,
} from "../types/VenmoOneTimePaymentSessionTypes";

export function useVenmoOneTimePaymentSession({
    presentationMode,
    createOrder,
    orderId,
    ...callbacks
}: UseVenmoOneTimePaymentSessionProps): UseVenmoOneTimePaymentSessionReturn {
    const { sdkInstance } = usePayPal();
    const sessionRef = useRef<VenmoOneTimePaymentSession | null>(null);
    const proxyCallbacks = useProxyProps(callbacks);

    useEffect(() => {
        if (!sdkInstance) {
            throw new Error("no sdk instance available");
        }

        const newSession = sdkInstance.createVenmoOneTimePaymentSession({
            orderId,
            ...proxyCallbacks,
        });
        sessionRef.current = newSession;

        return () => {
            if (sessionRef.current) {
                sessionRef.current.destroy();
                sessionRef.current = null;
            }
        };
    }, [sdkInstance, orderId, proxyCallbacks]);

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
        if (sessionRef.current) {
            sessionRef.current.cancel();
        }
    }, []);

    const handleDestroy = useCallback(() => {
        if (sessionRef.current) {
            sessionRef.current.destroy();
            sessionRef.current = null;
        }
    }, []);

    return {
        handleClick,
        handleCancel,
        handleDestroy,
    };
}
