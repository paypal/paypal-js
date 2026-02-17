import { useCallback, useEffect, useRef } from "react";

import { usePayPal } from "./usePayPal";
import { useIsMountedRef } from "./useIsMounted";
import { useError } from "./useError";
import { useProxyProps } from "../utils";
import { INSTANCE_LOADING_STATE } from "../types/PayPalProviderEnums";

import type {
    SavePaymentSession,
    PayPalPresentationModeOptions,
    SavePaymentSessionOptions,
    BasePaymentSessionReturn,
} from "../types";

export type UsePayPalSavePaymentSessionProps = (
    | (Omit<SavePaymentSessionOptions, "vaultSetupToken"> & {
          createVaultToken: () => Promise<{ vaultSetupToken: string }>;
          vaultSetupToken?: never;
      })
    | (SavePaymentSessionOptions & {
          createVaultToken?: never;
          vaultSetupToken: string;
      })
) &
    PayPalPresentationModeOptions;

/**
 * Hook for managing a PayPal save payment session, vault without purchase.
 *
 * This hook creates and manages a PayPal save payment session for vaulting payment methods.
 * It supports multiple presentation modes and handles session lifecycle, resume flows for redirect-based
 * flows, and provides methods to start, cancel, and destroy the session.
 *
 * @example
 * const { error, handleClick, handleCancel, handleDestroy } = usePayPalSavePaymentSession({
 *   presentationMode: 'popup',
 *   createVaultToken: async () => ({ vaultSetupToken: 'VAULT-TOKEN-123' }),
 *   onApprove: (data) => console.log('Vaulted:', data),
 *   onCancel: () => console.log('Cancelled'),
 * });
 *
 * return (
 *   <paypal-button onClick={handleClick}></paypal-button>
 * )
 */
export function usePayPalSavePaymentSession({
    presentationMode,
    fullPageOverlay,
    autoRedirect,
    createVaultToken,
    vaultSetupToken,
    ...callbacks
}: UsePayPalSavePaymentSessionProps): BasePaymentSessionReturn {
    const { sdkInstance, loadingStatus } = usePayPal();
    const isMountedRef = useIsMountedRef();
    const sessionRef = useRef<SavePaymentSession | null>(null);
    const proxyCallbacks = useProxyProps(callbacks);
    const [error, setError] = useError();
    const isPending = loadingStatus === INSTANCE_LOADING_STATE.PENDING;

    const handleDestroy = useCallback(() => {
        sessionRef.current?.destroy();
        sessionRef.current = null;
    }, []);

    // Separate error reporting effect to avoid infinite loops with proxyCallbacks
    useEffect(() => {
        if (sdkInstance) {
            setError(null);
        } else if (loadingStatus !== INSTANCE_LOADING_STATE.PENDING) {
            setError(new Error("no sdk instance available"));
        }
    }, [sdkInstance, setError, loadingStatus]);

    useEffect(() => {
        if (!sdkInstance) {
            return;
        }

        const newSession = sdkInstance.createPayPalSavePaymentSession({
            vaultSetupToken,
            ...proxyCallbacks,
        });
        sessionRef.current = newSession;

        const shouldCheckResume =
            presentationMode === "redirect" ||
            presentationMode === "direct-app-switch";

        if (shouldCheckResume) {
            const handleReturnFromPayPal = async () => {
                try {
                    if (!newSession) {
                        return;
                    }
                    const isResumeFlow = newSession.hasReturned?.();
                    if (isResumeFlow) {
                        await newSession.resume?.();
                    }
                } catch (err) {
                    setError(err as Error);
                }
            };

            handleReturnFromPayPal();
        }

        return handleDestroy;
    }, [
        sdkInstance,
        vaultSetupToken,
        proxyCallbacks,
        handleDestroy,
        presentationMode,
        setError,
    ]);

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
        setError,
    ]);

    return {
        error,
        isPending,
        handleClick,
        handleCancel,
        handleDestroy,
    };
}
