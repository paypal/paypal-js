import { useEffect, useRef, useState } from "react";

import { usePayPal } from "./usePayPal";
import { useDeepCompareMemoize } from "../utils";

import type {
    OneTimePaymentSession,
    PayLaterOneTimePaymentSessionOptions,
} from "../types";

export function usePayLaterOneTimePaymentSession(
    options: PayLaterOneTimePaymentSessionOptions,
): OneTimePaymentSession | null {
    const { sdkInstance } = usePayPal();
    const sessionRef = useRef<OneTimePaymentSession | null>(null); // handle cleanup
    const [session, updateSession] = useState<OneTimePaymentSession | null>(
        null,
    ); // handle session storage and force re-render
    const memoizedOptions = useDeepCompareMemoize(options);

    useEffect(() => {
        if (sessionRef.current) {
            sessionRef.current?.destroy();
            sessionRef.current = null;
            updateSession(null);
        }

        if (sdkInstance) {
            const newSession =
                sdkInstance.createPayLaterOneTimePaymentSession(
                    memoizedOptions,
                );
            sessionRef.current = newSession;
            updateSession(newSession);
        } else {
            // TODO what if sdk instance is not available? Error?
            throw new Error("no sdk instance available");
        }

        return () => {
            sessionRef.current?.destroy();
            sessionRef.current = null;
            updateSession(null);
        };
    }, [sdkInstance, memoizedOptions]);

    return session;
}
