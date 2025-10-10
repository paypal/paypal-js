import { useEffect, useRef, useState } from "react";

import { usePayPal } from "./usePayPal";
import { useDeepCompareMemoize } from "../utils";

import type {
    PayPalOneTimePaymentSessionOptions,
    OneTimePaymentSession,
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
export function usePayPalOneTimePaymentSession(
    options: PayPalOneTimePaymentSessionOptions,
): OneTimePaymentSession | null {
    const { sdkInstance } = usePayPal();
    const sessionRef = useRef<OneTimePaymentSession | null>(null);
    const [session, updateSession] = useState<OneTimePaymentSession | null>(
        null,
    );
    const memoizedOptions = useDeepCompareMemoize(options);

    useEffect(() => {
        if (sdkInstance) {
            const newSession =
                sdkInstance.createPayPalOneTimePaymentSession(memoizedOptions);
            sessionRef.current = newSession;
            updateSession(newSession);
        } else {
            throw new Error("no sdk instance available");
        }

        return () => {
            if (sessionRef.current) {
                sessionRef.current.destroy();
            }
            sessionRef.current = null;
        };
    }, [sdkInstance, memoizedOptions]);

    return session;
}
