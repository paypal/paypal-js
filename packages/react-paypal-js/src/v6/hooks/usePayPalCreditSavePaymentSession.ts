import { useCallback, useEffect, useRef } from "react";

import { usePayPal } from "./usePayPal";
import { useIsMountedRef } from "./useIsMounted";
import { useError } from "./useError";
import { useProxyProps, createPaymentSession } from "../utils";
import { INSTANCE_LOADING_STATE } from "../types/PayPalProviderEnums";

import type {
    SavePaymentSession,
    PayPalPresentationModeOptions,
    SavePaymentSessionOptions,
    BasePaymentSessionReturn,
} from "../types";

export type UsePayPalCreditSavePaymentSessionProps = (
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
 * Hook for managing PayPal Credit save payment sessions.
 *
 * This hook creates and manages a PayPal Credit save payment session for vaulting payment methods.
 * It handles session lifecycle, resume flows for redirect-based flows, and provides methods to start, cancel, and destroy the session.
 *
 * @returns Object with: `error` (any session error), `isPending` (SDK loading), `handleClick` (starts session), `handleCancel` (cancels session), `handleDestroy` (cleanup)
 *
 * @example
 * function SaveCreditButton() {
 *   const { error, isPending, handleClick, handleCancel } = usePayPalCreditSavePaymentSession({
 *     presentationMode: 'redirect',
 *     createVaultToken: async () => ({ vaultSetupToken: 'VAULT-TOKEN-123' }),
 *     onApprove: (data) => console.log('Vaulted:', data),
 *     onCancel: () => console.log('Cancelled'),
 *   });
 *   const { eligiblePaymentMethods } = usePayPal();
 *   const creditDetails = eligiblePaymentMethods?.getDetails?.("credit");
 *
 *   if (isPending) return null;
 *   if (error) return <div>Error: {error.message}</div>;
 *
 *   return (
 *     <paypal-credit-button
 *       countryCode={creditDetails?.countryCode}
 *       onClick={handleClick}
 *       onCancel={handleCancel}
 *     />
 *   );
 * }
 */
export function usePayPalCreditSavePaymentSession({
    presentationMode,
    fullPageOverlay,
    autoRedirect,
    createVaultToken,
    vaultSetupToken,
    ...callbacks
}: UsePayPalCreditSavePaymentSessionProps): BasePaymentSessionReturn {
    const { sdkInstance, loadingStatus } = usePayPal();
    const isMountedRef = useIsMountedRef();
    const sessionRef = useRef<SavePaymentSession | null>(null);
    const proxyCallbacks = useProxyProps(callbacks);
    const [error, setError] = useError();

    // Prevents retrying session creation with a failed SDK instance
    const failedSdkRef = useRef<unknown>(null);

    const isPending = loadingStatus === INSTANCE_LOADING_STATE.PENDING;

    const handleDestroy = useCallback(() => {
        sessionRef.current?.destroy();
        sessionRef.current = null;
    }, []);

    // Handle SDK availability
    useEffect(() => {
        // Reset failed SDK tracking when SDK instance changes
        if (failedSdkRef.current !== sdkInstance) {
            failedSdkRef.current = null;
        }

        if (sdkInstance) {
            setError(null);
        } else if (loadingStatus !== INSTANCE_LOADING_STATE.PENDING) {
            setError(new Error("no sdk instance available"));
        }
    }, [sdkInstance, setError, loadingStatus]);

    // Create and manage session lifecycle
    useEffect(() => {
        if (!sdkInstance) {
            return;
        }

        const newSession = createPaymentSession(
            () =>
                sdkInstance.createPayPalSavePaymentSession({
                    vaultSetupToken,
                    ...proxyCallbacks,
                }),
            failedSdkRef,
            sdkInstance,
            setError,
            "paypal-payments",
        );

        if (!newSession) {
            return;
        }

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

        return () => {
            newSession.destroy();
        };
    }, [
        sdkInstance,
        vaultSetupToken,
        proxyCallbacks,
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
            setError(new Error("Credit Save Payment session not available"));
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
        handleDestroy,
        handleCancel,
    };
}
