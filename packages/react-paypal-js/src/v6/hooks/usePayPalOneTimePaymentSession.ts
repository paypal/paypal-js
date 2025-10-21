import { useCallback, useEffect, useRef } from "react";

import { usePayPal } from "./usePayPal";
import { useProxyProps } from "../utils";
import {
    OneTimePaymentSession,
    PayPalPresentationModeOptions,
    UsePayPalOneTimePaymentSessionProps,
    UsePayPalOneTimePaymentSessionReturn,
} from "../types";

/**
 * Custom hook to create and manage a PayPal one-time payment session.
 *
 * This hook automatically creates a payment session when the SDK instance is available
 * and re-creates it when the options change. The options are memoized internally using
 * deep equality comparison to prevent unnecessary session recreation on re-renders.
 *
 * @param options - Configuration options for the payment session
 * @returns The OneTimePaymentSession instance or null if not yet created
 *
 * @example
 * ```tsx
 * const PayPalButton = (props) => {
 *   const paypalSession = usePayPalOneTimePaymentSession(props);
 *
 *   const handleClick = async () => {
 *     if (!paypalSession) return;
 *     await paypalSession.start({ presentationMode: "auto" }, orderData);
 *   };
 *
 *   return <button onClick={handleClick}>Pay with PayPal</button>;
 * };
 * ```
 */
export function usePayPalOneTimePaymentSession({
    presentationMode,
    createOrder,
    orderId,
    ...callbacks
}: UsePayPalOneTimePaymentSessionProps): UsePayPalOneTimePaymentSessionReturn | null {
    const { sdkInstance } = usePayPal();
    const sessionRef = useRef<OneTimePaymentSession | null>(null);
    const proxyCallbacks = useProxyProps(callbacks);

    const handleDestroy = useCallback(() => {
        sessionRef.current?.destroy();
        sessionRef.current = null;
    }, []);

    const handleCancel = useCallback(() => {
        sessionRef.current?.cancel();
    }, []);

    useEffect(() => {
        if (!sdkInstance) {
            throw new Error("no sdk instance available");
        }

        const newSession = sdkInstance.createPayPalOneTimePaymentSession({
            orderId,
            ...proxyCallbacks,
        });

        sessionRef.current = newSession;

        return handleDestroy;
    }, [sdkInstance, orderId, proxyCallbacks, handleDestroy]);

    const handleClick = useCallback(async () => {
        if (!sessionRef.current) {
            throw new Error("PayPal session not available");
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
        handleClick,
        handleCancel,
        handleDestroy,
    };
}
