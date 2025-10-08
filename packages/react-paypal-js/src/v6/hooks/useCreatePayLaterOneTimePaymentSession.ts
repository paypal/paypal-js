import { useEffect, useRef } from "react";

import { usePayPal } from "./usePayPal";

import type {
    OneTimePaymentSession,
    PayLaterOneTimePaymentSessionOptions,
} from "../types";

export function useCreatePayLaterOneTimePaymentSession({
    onApprove,
    onCancel,
    onComplete,
    onError,
}: PayLaterOneTimePaymentSessionOptions): OneTimePaymentSession | null {
    const { sdkInstance } = usePayPal();
    const session = useRef<OneTimePaymentSession | null>(null);

    useEffect(() => {
        if (!sdkInstance) {
            session.current = null;

            // TODO what if sdk instance is not available? Error?
            throw new Error("no sdk instance available");
        }

        // Cleanup previous session if it exists
        session.current?.destroy();

        session.current = sdkInstance.createPayLaterOneTimePaymentSession({
            onApprove,
            onCancel,
            onComplete,
            onError,
        });

        // Cleanup on unmount or dependency change
        return () => {
            session.current?.destroy();
        };
    }, [onApprove, onCancel, onComplete, onError, sdkInstance]);

    return session.current;
}
