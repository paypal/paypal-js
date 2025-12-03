import { useEffect, useRef } from "react";

import { usePayPal } from "./usePayPal";
import { useError } from "./useError";

import type { PayPalMessagesOptions, PayPalMessagesSession } from "../types";

type PayPalMessagesReturn = {
    error: Error | null;
};

export function usePayPalMessages({
    buyerCountry,
    currencyCode,
    shopperSessionId,
}: PayPalMessagesOptions): PayPalMessagesReturn {
    const { sdkInstance } = usePayPal();
    const sessionRef = useRef<PayPalMessagesSession | null>(null);
    const [error, setError] = useError();

    useEffect(() => {
        if (!sdkInstance) {
            setError(new Error("no sdk instance available"));
        }
    }, [sdkInstance, setError]);

    useEffect(() => {
        if (!sdkInstance) {
            return;
        }

        const newSession = sdkInstance.createPayPalMessages({
            buyerCountry,
            currencyCode,
            shopperSessionId,
        });

        sessionRef.current = newSession;
    }, [buyerCountry, currencyCode, sdkInstance, shopperSessionId]);

    return {
        error,
    };
}
