import { useCallback, useEffect, useRef } from "react";

import { usePayPal } from "./usePayPal";
import { useError } from "./useError";
import { useIsMountedRef } from "./useIsMounted";

import {
    type FetchContentOptions,
    type MessageContent,
    type PayPalMessagesOptions,
    type PayPalMessagesSession,
    type LearnMoreOptions,
    type LearnMore,
    INSTANCE_LOADING_STATE,
} from "../types";

type PayPalMessagesReturn = {
    error: Error | null;
    handleCreateLearnMore: (
        options?: LearnMoreOptions,
    ) => LearnMore | undefined;
    handleFetchContent: (
        options: FetchContentOptions,
    ) => Promise<MessageContent | void>;
};

export function usePayPalMessages({
    buyerCountry,
    currencyCode,
    shopperSessionId,
}: PayPalMessagesOptions): PayPalMessagesReturn {
    const { sdkInstance, loadingStatus } = usePayPal();
    const isMountedRef = useIsMountedRef();
    const sessionRef = useRef<PayPalMessagesSession | null>(null);
    const [error, setError] = useError();

    useEffect(() => {
        if (sdkInstance) {
            setError(null);
        } else if (loadingStatus !== INSTANCE_LOADING_STATE.PENDING) {
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

        return () => {
            sessionRef.current = null;
        };
    }, [buyerCountry, currencyCode, sdkInstance, shopperSessionId]);

    const handleFetchContent = useCallback(
        async (options: FetchContentOptions) => {
            if (!isMountedRef.current) {
                return;
            }

            if (!sessionRef.current) {
                setError(new Error("PayPal Messages session not available"));
                return;
            }

            try {
                const result = await sessionRef.current.fetchContent(options);

                // fetchContent will return null in the case of an API error
                if (result === null) {
                    setError(
                        new Error("Failed to fetch PayPal Messages content"),
                    );
                    return;
                }

                return result;
            } catch (err) {
                setError(err as Error);
                return;
            }
        },
        [isMountedRef, setError],
    );

    const handleCreateLearnMore = useCallback(
        (options?: LearnMoreOptions) => {
            if (!isMountedRef.current) {
                return;
            }

            if (!sessionRef.current) {
                setError(new Error("PayPal Messages session not available"));
                return;
            }

            return sessionRef.current.createLearnMore(options);
        },
        [isMountedRef, setError],
    );

    return {
        error,
        handleCreateLearnMore,
        handleFetchContent,
    };
}
