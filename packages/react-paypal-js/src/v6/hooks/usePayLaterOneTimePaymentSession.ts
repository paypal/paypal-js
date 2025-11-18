import { useCallback, useEffect, useRef, useState } from "react";

import { usePayPal } from "./usePayPal";
import { useIsMountedRef } from "./useIsMounted";
import { useProxyProps } from "../utils";

import type {
    BasePaymentSessionReturn,
    CreateOrderCallback,
    OneTimePaymentSession,
    PayLaterOneTimePaymentSessionOptions,
    PayPalPresentationModeOptions,
} from "../types";

export type PayLaterOneTimePaymentSessionProps = (
    | (Omit<PayLaterOneTimePaymentSessionOptions, "orderId"> & {
          createOrder: CreateOrderCallback;
          orderId?: never;
      })
    | (PayLaterOneTimePaymentSessionOptions & {
          createOrder?: never;
          orderId: string;
      })
) &
    PayPalPresentationModeOptions;

export function usePayLaterOneTimePaymentSession({
    presentationMode,
    fullPageOverlay,
    autoRedirect,
    createOrder,
    orderId,
    ...callbacks
}: PayLaterOneTimePaymentSessionProps): BasePaymentSessionReturn {
    const { sdkInstance } = usePayPal();
    const isMountedRef = useIsMountedRef();
    const sessionRef = useRef<OneTimePaymentSession | null>(null); // handle cleanup
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

        const newSession = sdkInstance.createPayLaterOneTimePaymentSession({
            orderId,
            ...proxyCallbacks,
        });
        sessionRef.current = newSession;

        // check for resume flow in redirect-based presentation modes
        const isRedirectMode =
            presentationMode === "redirect" ||
            presentationMode === "direct-app-switch";

        if (isRedirectMode) {
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
    }, [sdkInstance, orderId, proxyCallbacks, handleDestroy, presentationMode]);

    const handleCancel = useCallback(() => {
        sessionRef.current?.cancel();
    }, []);

    const handleClick = useCallback(async () => {
        if (!isMountedRef.current) {
            return;
        }

        if (!sessionRef.current) {
            setError(new Error("PayLater session not available"));
            return;
        }

        const startOptions = {
            presentationMode,
            fullPageOverlay,
            autoRedirect,
        } as PayPalPresentationModeOptions;

        const result = await sessionRef.current.start(
            startOptions,
            createOrder?.(),
        );
        return result;
    }, [
        createOrder,
        presentationMode,
        fullPageOverlay,
        autoRedirect,
        isMountedRef,
    ]);

    return {
        error,
        handleCancel,
        handleClick,
        handleDestroy,
    };
}
