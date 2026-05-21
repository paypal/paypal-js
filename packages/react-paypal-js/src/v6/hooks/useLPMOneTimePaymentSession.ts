import { useCallback, useEffect, useRef, useState } from "react";

import { usePayPal } from "./usePayPal";
import { useIsMountedRef } from "./useIsMounted";
import { useError } from "./useError";
import { useProxyProps, createPaymentSession } from "../utils";
import { INSTANCE_LOADING_STATE } from "../types/ProviderEnums";
import { LPM_REGISTRY } from "../config/lpmRegistry";

import type { LPMName } from "../config/lpmRegistry";
import type {
  LPMOneTimePaymentSession,
  LPMOneTimePaymentSessionOptions,
  LPMOneTimePaymentSessionPromise,
  LPMPresentationModeOptions,
  LPMPaymentsInstance,
  BasePaymentSessionReturn,
} from "../types";

export interface LPMPaymentSessionReturn extends BasePaymentSessionReturn {
  session: LPMOneTimePaymentSession | null;
}

export type UseLPMOneTimePaymentSessionProps = {
  lpm: LPMName;
} & (
  | (Omit<LPMOneTimePaymentSessionOptions, "orderId"> & {
      createOrder: () => LPMOneTimePaymentSessionPromise;
      orderId?: never;
    })
  | (LPMOneTimePaymentSessionOptions & {
      createOrder?: never;
      orderId: string;
    })
) &
  LPMPresentationModeOptions;

export function useLPMOneTimePaymentSession({
  lpm,
  presentationMode,
  fullPageOverlay,
  createOrder,
  orderId,
  ...callbacks
}: UseLPMOneTimePaymentSessionProps): LPMPaymentSessionReturn {
  const config = LPM_REGISTRY[lpm];
  const { sdkInstance, loadingStatus } = usePayPal();
  const isMountedRef = useIsMountedRef();
  const sessionRef = useRef<LPMOneTimePaymentSession | null>(null);
  const [sessionState, setSessionState] = useState<LPMOneTimePaymentSession | null>(null);
  const proxyCallbacks = useProxyProps(callbacks);
  const [error, setError] = useError();

  const failedSdkRef = useRef<unknown>(null);

  const isPending = loadingStatus === INSTANCE_LOADING_STATE.PENDING;

  const handleDestroy = useCallback(() => {
    sessionRef.current?.destroy();
    sessionRef.current = null;
    setSessionState(null);
  }, []);

  useEffect(() => {
    if (failedSdkRef.current !== sdkInstance) {
      failedSdkRef.current = null;
    }

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

    const createSession = (sdkInstance as LPMPaymentsInstance)[
      config.sessionMethod
    ];

    if (!createSession) {
      setError(
        new Error(
          `Session method "${config.sessionMethod}" not found. ` +
            `Ensure "${config.component}" is included in the SDK components array.`,
        ),
      );
      return;
    }

    const newSession = createPaymentSession({
      sessionCreator: () =>
        createSession({
          orderId,
          ...proxyCallbacks,
        }),
      failedSdkRef,
      sdkInstance,
      setError,
      errorMessage:
        `Failed to create payment session. This may occur if the required component "${config.component}" is not included in the SDK components array.`,
    });

    if (!newSession) {
      return;
    }

    sessionRef.current = newSession;
    setSessionState(newSession);

    return () => {
      newSession.destroy();
      setSessionState(null);
    };
  }, [sdkInstance, orderId, proxyCallbacks, setError, config]);

  const handleCancel = useCallback(() => {
    sessionRef.current?.cancel();
  }, []);

  const handleClick = useCallback(async () => {
    if (!isMountedRef.current) {
      return;
    }

    if (!sessionRef.current) {
      setError(new Error(`${config.displayName} session not available`));
      return;
    }

    const startOptions = {
      presentationMode,
      fullPageOverlay,
    } as LPMPresentationModeOptions;

    await sessionRef.current.start(startOptions, createOrder?.());
  }, [isMountedRef, presentationMode, fullPageOverlay, createOrder, setError, config]);

  return {
    error,
    isPending,
    session: sessionState,
    handleCancel,
    handleClick,
    handleDestroy,
  };
}
