import { useCallback, useEffect, useRef, useState } from "react";

import { usePayPal } from "./usePayPal";
import { useIsMountedRef } from "./useIsMounted";
import { useError } from "./useError";
import { useProxyProps, createPaymentSession } from "../utils";
import { INSTANCE_LOADING_STATE } from "../types/ProviderEnums";
import { LPM_REGISTRY } from "../config/lpmRegistry";

import type { LPMName } from "../config/lpmRegistry";
import type {
  LPMSessionFields,
  LPMStartOptions,
  LPMOneTimePaymentSession,
  LPMOneTimePaymentSessionOptions,
  LPMOneTimePaymentSessionPromise,
  LPMPresentationModeOptions,
  LPMPaymentsInstance,
  BasePaymentSessionReturn,
} from "../types";

export interface LPMPaymentSessionReturn extends BasePaymentSessionReturn {
  session: LPMOneTimePaymentSession | null;
  handleValidate: () => Promise<boolean>;
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
  LPMPresentationModeOptions &
  LPMSessionFields;

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
  const [sessionState, setSessionState] =
    useState<LPMOneTimePaymentSession | null>(null);
  const proxyCallbacks = useProxyProps(callbacks);
  const [error, setError] = useError();

  // Stabilize createOrder reference so handleClick doesn't recreate on every render
  const createOrderRef = useRef(createOrder);
  createOrderRef.current = createOrder;

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
      errorMessage: `Failed to create payment session. This may occur if the required component "${config.component}" is not included in the SDK components array.`,
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
    // proxyCallbacks is a stable Proxy reference (see useProxyProps) that is
    // mutated in place on every render — including it here would recreate the
    // session whenever its identity changes instead of only when session
    // inputs actually change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sdkInstance, orderId, setError, config]);

  const handleCancel = useCallback(() => {
    sessionRef.current?.cancel();
  }, []);

  const handleValidate = useCallback(async (): Promise<boolean> => {
    return sessionRef.current?.validate() ?? false;
  }, []);

  const handleClick = useCallback(async () => {
    if (!isMountedRef.current) {
      return;
    }

    if (!sessionRef.current) {
      setError(new Error(`${config.displayName} session not available`));
      return;
    }

    // Collect merchant-provided session-level fields (phone, billingAddress,
    // taxInfo, etc.) required by specific LPMs (e.g. MB WAY, Pix, DOKU).
    const sessionFieldValues: Partial<LPMSessionFields> = {};
    for (const field of config.sessionFields) {
      const key = field as keyof LPMSessionFields;
      const value = (proxyCallbacks as unknown as LPMSessionFields)[key];
      if (value !== undefined) {
        (sessionFieldValues as Record<string, unknown>)[field] = value;
      }
    }

    const startOptions: LPMStartOptions = {
      presentationMode,
      fullPageOverlay,
    } as LPMStartOptions;

    // Session fields are merchant-collected inputs resolved on the
    // paymentSessionPromise (start()'s 2nd argument), not on the
    // presentation-mode options (1st argument).
    const paymentSessionPromise: LPMOneTimePaymentSessionPromise = (
      createOrderRef.current
        ? createOrderRef.current()
        : Promise.resolve({ orderId: orderId as string })
    ).then((result) => ({ ...result, ...sessionFieldValues }));

    await sessionRef.current.start(startOptions, paymentSessionPromise);
  }, [
    isMountedRef,
    presentationMode,
    fullPageOverlay,
    setError,
    config,
    proxyCallbacks,
    orderId,
  ]);

  return {
    error,
    isPending,
    session: sessionState,
    handleCancel,
    handleClick,
    handleDestroy,
    handleValidate,
  };
}
