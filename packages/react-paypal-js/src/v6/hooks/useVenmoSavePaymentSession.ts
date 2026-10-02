import { useCallback, useEffect, useRef } from "react";

import { usePayPal } from "./usePayPal";
import { useIsMountedRef } from "./useIsMounted";
import { useError } from "./useError";
import { useProxyProps, createPaymentSession } from "../utils";
import { INSTANCE_LOADING_STATE } from "../types/ProviderEnums";

import type {
  VenmoSavePaymentSession,
  VenmoPresentationModeOptions,
  VenmoSavePaymentSessionOptions,
  VenmoSavePaymentSessionPromise,
  BasePaymentSessionReturn,
  WithOptionalPresentationMode,
} from "../types";

/**
 * `sandboxSupport` is a temporary Venmo sandbox-testing flag that the JS SDK will
 * remove once it is no longer needed. It is intentionally typed locally here
 * rather than in `@paypal/paypal-js`, so it can be dropped from react-paypal-js
 * without a breaking change to the published SDK types.
 */
type VenmoSandboxSupport = {
  sandboxSupport?: { enabled: boolean };
};

export type UseVenmoSavePaymentSessionProps = (
  | (Omit<VenmoSavePaymentSessionOptions, "vaultSetupToken"> & {
      createVaultToken: () => VenmoSavePaymentSessionPromise;
      vaultSetupToken?: never;
    })
  | (VenmoSavePaymentSessionOptions & {
      createVaultToken?: never;
      vaultSetupToken: string;
    })
) &
  WithOptionalPresentationMode<VenmoPresentationModeOptions> &
  VenmoSandboxSupport;

/**
 * Hook for managing a Venmo save payment session, vault without purchase.
 *
 * This hook creates and manages a Venmo save payment session for vaulting a buyer's
 * Venmo account without completing a purchase. It handles session lifecycle and
 * provides methods to start, cancel, and destroy the session.
 *
 * `presentationMode` is optional and defaults to `"auto"`.
 *
 * For a flow that vaults the Venmo account while also completing an order
 * (VAULT_WITH_PAYMENT), pass `savePayment: true` to {@link useVenmoOneTimePaymentSession} instead.
 *
 * @returns Object with: `error` (any session error), `isPending` (SDK loading), `handleClick` (starts session), `handleCancel` (cancels session), `handleDestroy` (cleanup)
 *
 * @example
 * function SaveVenmoButton() {
 *   const { error, isPending, handleClick, handleCancel } = useVenmoSavePaymentSession({
 *     createVaultToken: async () => ({ vaultSetupToken: 'VAULT-TOKEN-123' }),
 *     onApprove: (data) => console.log('Vaulted:', data),
 *     onCancel: () => console.log('Cancelled'),
 *   });
 *
 *   if (isPending) return null;
 *   if (error) return <div>Error: {error.message}</div>;
 *
 *   return (
 *     <venmo-button onClick={handleClick} onCancel={handleCancel} />
 *   );
 * }
 */
export function useVenmoSavePaymentSession({
  presentationMode = "auto",
  fullPageOverlay,
  createVaultToken,
  vaultSetupToken,
  sandboxSupport,
  ...callbacks
}: UseVenmoSavePaymentSessionProps): BasePaymentSessionReturn {
  const { sdkInstance, loadingStatus } = usePayPal();
  const isMountedRef = useIsMountedRef();
  const sessionRef = useRef<VenmoSavePaymentSession | null>(null);
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

    const newSession = createPaymentSession({
      sessionCreator: () =>
        sdkInstance.createVenmoSavePaymentSession({
          vaultSetupToken,
          ...proxyCallbacks,
        }),
      failedSdkRef,
      sdkInstance,
      setError,
      errorMessage:
        'Failed to create payment session. This may occur if the required component "venmo-payments" is not included in the SDK components array.',
    });

    if (!newSession) {
      return;
    }

    sessionRef.current = newSession;

    return () => {
      newSession.destroy();
    };
  }, [sdkInstance, vaultSetupToken, proxyCallbacks, setError]);

  const handleCancel = useCallback(() => {
    sessionRef.current?.cancel();
  }, []);

  const handleClick = useCallback(async () => {
    if (!isMountedRef.current) {
      return;
    }

    if (!sessionRef.current) {
      setError(new Error("Venmo session not available"));
      return;
    }

    const startOptions = {
      presentationMode,
      fullPageOverlay,
      ...(sandboxSupport && { sandboxSupport }),
    } as VenmoPresentationModeOptions & VenmoSandboxSupport;

    if (createVaultToken) {
      await sessionRef.current.start(startOptions, createVaultToken());
    } else {
      await sessionRef.current.start(startOptions);
    }
  }, [
    isMountedRef,
    presentationMode,
    fullPageOverlay,
    sandboxSupport,
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
