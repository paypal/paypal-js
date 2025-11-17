import { useCallback, useEffect, useRef, useState } from "react";

import { usePayPal } from "./usePayPal";
import { useIsMountedRef } from "./useIsMounted";
import { useProxyProps } from "../utils";
import {
    OneTimePaymentSession,
    PayPalPresentationModeOptions,
    PayPalOneTimePaymentSessionOptions,
    BasePaymentSessionReturn,
} from "../types";

export type UsePayPalOneTimePaymentSessionProps = (
    | (Omit<PayPalOneTimePaymentSessionOptions, "orderId"> & {
          createOrder: () => Promise<{ orderId: string }>;
          orderId?: never;
      })
    | (PayPalOneTimePaymentSessionOptions & {
          createOrder?: never;
          orderId: string;
      })
) &
    PayPalPresentationModeOptions;

export function usePayPalOneTimePaymentSession({
    presentationMode,
    fullPageOverlay,
    autoRedirect,
    createOrder,
    orderId,
    ...callbacks
}: UsePayPalOneTimePaymentSessionProps): BasePaymentSessionReturn {
    const { sdkInstance } = usePayPal();
    const isMountedRef = useIsMountedRef();
    const sessionRef = useRef<OneTimePaymentSession | null>(null);
    const proxyCallbacks = useProxyProps(callbacks);
    const [error, setError] = useState<Error | null>(null);

    const handleDestroy = useCallback(() => {
        sessionRef.current?.destroy();
        sessionRef.current = null;
    }, []);

    const handleCancel = useCallback(() => {
        sessionRef.current?.cancel();
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

        // Create session (can be created without orderId for resume detection)
        const newSession = sdkInstance.createPayPalOneTimePaymentSession({
            orderId,
            ...proxyCallbacks,
        });

        sessionRef.current = newSession;

        // Only check for resume flow in redirect-based presentation modes
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
    }, [sdkInstance, orderId, proxyCallbacks, handleDestroy, presentationMode]);

    const handleClick = useCallback(async () => {
        if (!isMountedRef.current) {
            return;
        }

        if (!sessionRef.current) {
            setError(new Error("PayPal session not available"));
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
        isMountedRef,
        presentationMode,
        fullPageOverlay,
        autoRedirect,
        createOrder,
    ]);

    return {
        error,
        handleClick,
        handleCancel,
        handleDestroy,
    };
}
