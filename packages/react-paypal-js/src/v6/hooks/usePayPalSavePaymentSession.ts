import { useCallback, useEffect, useRef, useState } from "react";

import { usePayPal } from "./usePayPal";
import { useIsMountedRef } from "./useIsMounted";
import { useProxyProps } from "../utils";

import type {
    SavePaymentSession,
    PayPalPresentationModeOptions,
    SavePaymentSessionOptions,
    BasePaymentSessionReturn,
} from "../types";

export type PayPalSavePaymentSessionProps = (
    | (Omit<SavePaymentSessionOptions, "orderId"> & {
          createVaultToken: () => Promise<{ vaultSetupToken: string }>;
          vaultSetupToken?: never;
      })
    | (SavePaymentSessionOptions & {
          createVaultToken?: never;
          vaultSetupToken: string;
      })
) &
    PayPalPresentationModeOptions;

export function usePayPalSavePaymentSession({
    presentationMode,
    fullPageOverlay,
    autoRedirect,
    createVaultToken,
    vaultSetupToken,
    ...callbacks
}: PayPalSavePaymentSessionProps): BasePaymentSessionReturn {
    const { sdkInstance } = usePayPal();
    const isMountedRef = useIsMountedRef();
    const sessionRef = useRef<SavePaymentSession | null>(null); // handle cleanup
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
        if (!isMountedRef.current) {
            return;
        }

        if (!sessionRef.current) {
            setError(new Error("Save Payment session not available"));
            return;
        }

        const startOptions = {
            presentationMode,
            fullPageOverlay,
            autoRedirect,
        } as PayPalPresentationModeOptions;

        if (createVaultToken) {
            await sessionRef.current.start(startOptions, createVaultToken());
        } else {
            await sessionRef.current.start(startOptions);
        }
    }, [
        isMountedRef,
        presentationMode,
        fullPageOverlay,
        autoRedirect,
        createVaultToken,
    ]);

    return {
        error,
        handleCancel,
        handleClick,
        handleDestroy,
    };
}
