import { useCallback, useEffect, useRef } from "react";

import { usePayPal } from "./usePayPal";
import { useProxyProps } from "../utils";

import type {
    SavePaymentSession,
    PayPalPresentationModeOptions,
    PayPalSavePaymentSessionProps,
    PayPalSavePaymentSessionReturn,
} from "../types";

export function usePayPaySavePaymentSession({
    presentationMode,
    createVaultToken,
    vaultSetupToken,
    ...callbacks
}: PayPalSavePaymentSessionProps): PayPalSavePaymentSessionReturn {
    const { sdkInstance } = usePayPal();
    const sessionRef = useRef<SavePaymentSession | null>(null); // handle cleanup
    const proxyCallbacks = useProxyProps(callbacks);

    const handleDestroy = useCallback(() => {
        sessionRef.current?.destroy();
        sessionRef.current = null;
    }, []);

    useEffect(() => {
        if (!sdkInstance) {
            throw new Error("no sdk instance available");
        }

        const newSession = sdkInstance.createPayPalSavePaymentSession({
            vaultSetupToken,
            ...proxyCallbacks,
        });
        sessionRef.current = newSession;

        return handleDestroy;
    }, [sdkInstance, vaultSetupToken, proxyCallbacks, handleDestroy]);

    const handleCancel = useCallback(() => {
        sessionRef.current?.cancel();
    }, []);

    const handleClick = useCallback(async () => {
        if (!sessionRef.current) {
            throw new Error("paylater session not available");
        }

        const startOptions: PayPalPresentationModeOptions = {
            presentationMode,
        };

        if (createVaultToken) {
            await sessionRef.current.start(startOptions, createVaultToken());
        } else {
            await sessionRef.current.start(startOptions);
        }
    }, [createVaultToken, presentationMode]);

    return {
        handleCancel,
        handleClick,
        handleDestroy,
    };
}
