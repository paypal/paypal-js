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
 * Hook for creating a PayPal Messages session to fetch messaging content and create learn more modals.
 *
 * This hook manages the lifecycle of a PayPal Messages session. It supports two integration modes:
 *
 * - **Auto-bootstrap**: Pass an empty options object and let `<paypal-message auto-bootstrap>` handle
 *   content fetching automatically. This is the simplest integration path.
 * - **Manual fetch**: Use `handleFetchContent` with an `onReady` callback to programmatically fetch
 *   and apply content via `setContent()`. Use this when you need control over when content is fetched
 *   or want to customize fetch options per render.
 *
 * Use `handleCreateLearnMore` to create a learn more modal that can be opened programmatically.
 *
 * @returns Object with: `error` (any session error), `isReady` (session created), `handleFetchContent` (fetches message content), `handleCreateLearnMore` (creates learn more modal)
 *
 * @example
 * // Auto-bootstrap mode (recommended for basic usage)
 * function PayPalMessaging({ amount }: { amount: string }) {
 *   const { error } = usePayPalMessages({});
 *
 *   if (error) return null;
 *
 *   return (
 *     <paypal-message
 *       auto-bootstrap={true}
 *       amount={amount}
 *       currency-code="USD"
 *       buyer-country="US"
 *     />
 *   );
 * }
 *
 * @example
 * // Manual fetch mode (for advanced control)
 * function ManualMessaging({ amount }: { amount: string }) {
 *   const containerRef = useRef<PayPalMessagesElement | null>(null);
 *   const { handleFetchContent, isReady } = usePayPalMessages({
 *     buyerCountry: 'US',
 *     currencyCode: 'USD',
 *   });
 *
 *   useEffect(() => {
 *     if (!isReady) return;
 *
 *     handleFetchContent({
 *       amount,
 *       logoPosition: 'INLINE',
 *       logoType: 'WORDMARK',
 *       onReady: (content) => {
 *         containerRef.current?.setContent(content);
 *       },
 *     });
 *   }, [amount, isReady, handleFetchContent]);
 *
 *   return <paypal-message ref={containerRef} />;
 * }
 */
export function usePayPalMessages({
    buyerCountry,
    currencyCode,
    shopperSessionId,
}: PayPalMessagesOptions): PayPalMessagesReturn {
    const { sdkInstance, loadingStatus } = usePayPal();
    const isMountedRef = useIsMountedRef();
    const [session, setSession] = useState<PayPalMessagesSession | null>(null);
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
