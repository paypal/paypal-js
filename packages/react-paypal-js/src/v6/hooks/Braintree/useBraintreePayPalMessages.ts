import { useCallback, useEffect, useRef, useState } from "react";

import { useBraintreePayPal } from "./useBraintreePayPal";
import { useIsMountedRef } from "../useIsMounted";
import { useError } from "../useError";
import { INSTANCE_LOADING_STATE } from "../../types/ProviderEnums";

import type {
  BraintreeMessagesOptions,
  BraintreeMessagesInstance,
  BraintreeMessageContent,
  BraintreeFetchMessageContentOptions,
} from "../../types/braintree";

export type UseBraintreePayPalMessagesProps = BraintreeMessagesOptions;

export interface UseBraintreePayPalMessagesReturn {
  error: Error | null;
  isReady: boolean;
  isLoading: boolean;
  handleFetchContent: (
    options?: BraintreeFetchMessageContentOptions,
  ) => Promise<BraintreeMessageContent | void>;
}

/**
 * Hook for creating a Braintree PayPal Messages instance to fetch promotional /
 * BNPL messaging content for `<paypal-message>` elements.
 *
 * Wraps {@link https://braintree.github.io/braintree-web/current/PayPalCheckoutV6.html#createMessages | BraintreePayPalCheckoutInstance.createMessages}
 * on the shared instance from {@link useBraintreePayPal}. Unlike the PayPal SDK's
 * synchronous `createPayPalMessages`, Braintree's `createMessages` is asynchronous,
 * so the instance is created in an effect that awaits the Promise and guards against
 * unmount / instance change before storing it.
 *
 * Use `handleFetchContent` to fetch content for a `<paypal-message>` element. It
 * resolves to the content object, which exposes `update({ amount })` so you can
 * change the displayed amount later without re-fetching.
 *
 * @returns Object with: `error` (any instance/fetch error), `isReady` (messages
 * instance created), `isLoading` (instance initializing or being created),
 * `handleFetchContent` (fetches message content)
 *
 * @example
 * function PayPalMessaging({ amount }: { amount: string }) {
 *   const messageRef = useRef<PayPalMessagesElement | null>(null);
 *   const { handleFetchContent, isReady } = useBraintreePayPalMessages({
 *     buyerCountry: "US",
 *     currencyCode: "USD",
 *   });
 *
 *   useEffect(() => {
 *     if (!isReady) return;
 *
 *     handleFetchContent({
 *       amount,
 *       onReady: (content) => {
 *         messageRef.current?.setContent(content);
 *       },
 *     });
 *   }, [amount, isReady, handleFetchContent]);
 *
 *   return <paypal-message ref={messageRef} />;
 * }
 */
export function useBraintreePayPalMessages({
  buyerCountry,
  currencyCode,
}: UseBraintreePayPalMessagesProps): UseBraintreePayPalMessagesReturn {
  const {
    braintreePayPalCheckoutInstance,
    loadingStatus,
    error: contextError,
  } = useBraintreePayPal();
  const isMountedRef = useIsMountedRef();
  const [messages, setMessages] = useState<BraintreeMessagesInstance | null>(
    null,
  );
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useError();

  // Prevents auto-retrying the exact (instance, buyerCountry, currencyCode) call
  // that just failed. Keyed on the options too so that changing them on the same
  // failed instance is still allowed to retry.
  const failedInstanceRef = useRef<{
    instance: typeof braintreePayPalCheckoutInstance;
    buyerCountry?: string;
    currencyCode?: string;
  } | null>(null);

  // Surface instance availability as an error, mirroring the other Braintree hooks.
  useEffect(() => {
    if (braintreePayPalCheckoutInstance) {
      setError(null);
    } else if (loadingStatus !== INSTANCE_LOADING_STATE.PENDING) {
      setError(new Error("Braintree PayPal Messages instance not available"));
    }
  }, [braintreePayPalCheckoutInstance, setError, loadingStatus]);

  // Create the messages instance. createMessages is async, so await the Promise
  // and guard against unmount / instance change before committing state.
  useEffect(() => {
    if (
      failedInstanceRef.current?.instance !== braintreePayPalCheckoutInstance
    ) {
      failedInstanceRef.current = null;
    }

    if (!braintreePayPalCheckoutInstance) {
      return;
    }

    if (
      failedInstanceRef.current?.instance === braintreePayPalCheckoutInstance &&
      failedInstanceRef.current?.buyerCountry === buyerCountry &&
      failedInstanceRef.current?.currencyCode === currencyCode
    ) {
      return;
    }

    let isSubscribed = true;
    setIsCreating(true);

    braintreePayPalCheckoutInstance
      .createMessages({ buyerCountry, currencyCode })
      .then((messagesInstance) => {
        if (!isSubscribed || !isMountedRef.current) {
          return;
        }
        setMessages(messagesInstance);
      })
      .catch((err: unknown) => {
        if (!isSubscribed || !isMountedRef.current) {
          return;
        }
        failedInstanceRef.current = {
          instance: braintreePayPalCheckoutInstance,
          buyerCountry,
          currencyCode,
        };
        setError(err);
      })
      .finally(() => {
        if (!isSubscribed || !isMountedRef.current) {
          return;
        }
        setIsCreating(false);
      });

    return () => {
      isSubscribed = false;
      setMessages(null);
    };
  }, [
    braintreePayPalCheckoutInstance,
    buyerCountry,
    currencyCode,
    isMountedRef,
    setError,
  ]);

  const handleFetchContent = useCallback(
    async (options?: BraintreeFetchMessageContentOptions) => {
      if (!isMountedRef.current) {
        return;
      }

      if (!messages) {
        setError(new Error("PayPal Messages instance not available"));
        return;
      }

      const result = await messages.fetchContent(options);

      // fetchContent will return null in the case of an API error
      if (result === null) {
        setError(new Error("Failed to fetch PayPal Messages content"));
        return;
      }

      return result;
    },
    [isMountedRef, messages, setError],
  );

  // Provider-level failures (e.g. the checkout instance failed to initialize)
  // are surfaced in their own return and labeled, distinct from instance/fetch
  // errors, so the developer can tell which layer failed — rather than merging
  // both into a single error.
  if (contextError) {
    return {
      error: new Error(`Braintree PayPal context error: ${contextError}`),
      isReady: false,
      isLoading: false,
      handleFetchContent,
    };
  }

  const isReady = Boolean(messages);
  const isLoading =
    !error &&
    (loadingStatus === INSTANCE_LOADING_STATE.PENDING ||
      isCreating ||
      !messages);

  return {
    error,
    isReady,
    isLoading,
    handleFetchContent,
  };
}
