import { useCallback, useEffect, useState } from "react";

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
    isReady: boolean;
    handleCreateLearnMore: (
        options?: LearnMoreOptions,
    ) => LearnMore | undefined;
    handleFetchContent: (
        options: FetchContentOptions,
    ) => Promise<MessageContent | void>;
};

/**
 * `usePayPalMessages` is used to create a PayPal Messages session for fetching messaging content
 * and creating learn more modals.
 *
 * @param {PayPalMessagesOptions} options - Configuration options including buyerCountry, currencyCode, and shopperSessionId
 * @returns {PayPalMessagesReturn} An object containing error state, isReady status, and handlers for creating learn more modals and fetching content
 *
 * @example
 * const { error, isReady, handleCreateLearnMore, handleFetchContent } = usePayPalMessages({
 *   buyerCountry: 'US',
 *   currencyCode: 'USD',
 *   shopperSessionId: 'session-123'
 * });
 */
export function usePayPalMessages({
    buyerCountry,
    currencyCode,
    shopperSessionId,
}: PayPalMessagesOptions): PayPalMessagesReturn {
    const { sdkInstance, loadingStatus } = usePayPal();
    const isMountedRef = useIsMountedRef();
    const [session, setSession] = useState<PayPalMessagesSession | null>(null); //useRef
    const [error, setError] = useError();

    useEffect(() => {
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

        const newSession = sdkInstance.createPayPalMessages({
            buyerCountry,
            currencyCode,
            shopperSessionId,
        });

        setSession(newSession);

        return () => {
            setSession(null);
        };
    }, [buyerCountry, currencyCode, sdkInstance, shopperSessionId]);

    const handleFetchContent = useCallback(
        async (options: FetchContentOptions) => {
            if (!isMountedRef.current) {
                return;
            }

            if (!session) {
                setError(new Error("PayPal Messages session not available"));
                return;
            }

            const result = await session.fetchContent(options);

            // fetchContent will return null in the case of an API error
            if (result === null) {
                setError(new Error("Failed to fetch PayPal Messages content"));
                return;
            }

            return result;
        },
        [isMountedRef, session, setError],
    );

    const handleCreateLearnMore = useCallback(
        (options?: LearnMoreOptions) => {
            if (!isMountedRef.current) {
                return;
            }

            if (!session) {
                setError(new Error("PayPal Messages session not available"));
                return;
            }

            return session.createLearnMore(options);
        },
        [isMountedRef, session, setError],
    );

    return {
        error,
        isReady: Boolean(session),
        handleCreateLearnMore,
        handleFetchContent,
    };
}
