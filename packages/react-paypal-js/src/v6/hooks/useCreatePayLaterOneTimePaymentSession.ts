import { useCallback, useEffect, useRef } from "react";

import { usePayPal } from "./usePayPal";
import { useProxyProps } from "../utils";

import type {
    OneTimePaymentSession,
    PayPalPresentationModeOptions,
    PayLaterOneTimePaymentSessionProps,
    PayLaterOneTimePaymentSessionReturn,
} from "../types";

// TODO tests
// TODO example
// TODO eligibility
export function usePayLaterOneTimePaymentSession({
    presentationMode,
    createOrder,
    orderId,
    ...callbacks
}: PayLaterOneTimePaymentSessionProps): PayLaterOneTimePaymentSessionReturn {
    const { sdkInstance } = usePayPal();
    const sessionRef = useRef<OneTimePaymentSession | null>(null); // handle cleanup
    const proxyCallbacks = useProxyProps(callbacks);

    // TODO which props should be exposed for this session type?

    const handleDestroy = useCallback(() => {
        if (sessionRef.current) {
            sessionRef.current.destroy();
            sessionRef.current = null;
        }
    }, []);

    useEffect(() => {
        if (!sdkInstance) {
            // TODO what if sdk instance is not available? Error?
            throw new Error("no sdk instance available");
        }

        const newSession = sdkInstance.createPayLaterOneTimePaymentSession({
            orderId,
            ...proxyCallbacks,
        });
        sessionRef.current = newSession;

        return handleDestroy;
    }, [sdkInstance, orderId, proxyCallbacks, handleDestroy]);

    const handleCancel = useCallback(() => {
        if (sessionRef.current) {
            sessionRef.current.cancel();
        }
    }, []);

    const handleClick = useCallback(async () => {
        if (!sessionRef.current) {
            throw new Error("paylater session not available");
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
        handleCancel,
        handleClick,
        handleDestroy,
    };
}
