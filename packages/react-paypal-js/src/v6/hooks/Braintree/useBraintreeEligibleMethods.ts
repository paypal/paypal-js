import { useEffect, useRef, useState } from "react";

import { useBraintreePayPal } from "./useBraintreePayPal";
import { useBraintreePayPalDispatch } from "./useBraintreePayPalDispatch";
import { useIsMountedRef } from "../useIsMounted";
import { useError } from "../useError";
import { deepEqual, useDeepCompareMemoize } from "../../utils";
import {
  BRAINTREE_DISPATCH_ACTION,
  INSTANCE_LOADING_STATE,
} from "../../types/ProviderEnums";

import type {
  BraintreeEligibilityResult,
  BraintreeFindEligibleMethodsOptions,
} from "../../types/braintree";

export type UseBraintreeEligibleMethodsProps =
  BraintreeFindEligibleMethodsOptions;

export interface UseBraintreeEligibleMethodsReturn {
  eligibleMethods: BraintreeEligibilityResult | null;
  isLoading: boolean;
  error: Error | null;
}

/**
 * Hook for fetching Braintree PayPal eligibility for given checkout options.
 *
 * Calls {@link https://braintree.github.io/braintree-web/current/PayPalCheckoutV6.html#findEligibleMethods | BraintreePayPalCheckoutInstance.findEligibleMethods}
 * on the shared instance from {@link useBraintreePayPal} and stores the result
 * in the `BraintreePayPalProvider` context. The fetch is deduplicated by
 * `(instance, options)` so that mounting this hook in multiple components, or
 * re-mounting it with the same options, will reuse the cached result instead
 * of firing a new request. The hook re-fetches when the options change.
 *
 * `isPending` is true while the provider's checkout instance is initializing
 * OR while eligibility is being fetched OR while the cached eligibility was
 * fetched with different options than the ones currently requested.
 *
 * @example
 * function Checkout() {
 *   const { eligibleMethods, isPending, error } = useBraintreeEligibleMethods({
 *     amount: "10.00",
 *     currency: "USD",
 *     countryCode: "US",
 *     paymentFlow: "ONE_TIME_PAYMENT",
 *   });
 *
 *   if (isPending) return <Spinner />;
 *   if (error) return <ErrorMessage error={error} />;
 *
 *   return (
 *     <>
 *       {eligibleMethods?.paypal && <BraintreePayPalOneTimePaymentButton ... />}
 *       {eligibleMethods?.paylater && <PayPalPayLaterButton ... />}
 *     </>
 *   );
 * }
 */
export function useBraintreeEligibleMethods({
  amount,
  currency,
  countryCode,
  paymentFlow,
}: UseBraintreeEligibleMethodsProps): UseBraintreeEligibleMethodsReturn {
  const {
    braintreePayPalCheckoutInstance,
    eligibleMethods,
    eligibleMethodsPayload,
    loadingStatus,
  } = useBraintreePayPal();
  const dispatch = useBraintreePayPalDispatch();
  const isMountedRef = useIsMountedRef();
  const [error, setError] = useError();
  const [isFetching, setIsFetching] = useState(false);

  // Refs let the effect see the latest context-cached eligibility without
  // adding it to the dep array (which would re-run the effect every time
  // *we* dispatch SET_ELIGIBILITY and re-trigger the fetch).
  const eligibleMethodsRef = useRef(eligibleMethods);
  const eligibleMethodsPayloadRef = useRef(eligibleMethodsPayload);
  eligibleMethodsRef.current = eligibleMethods;
  eligibleMethodsPayloadRef.current = eligibleMethodsPayload;

  const memoizedOptions = useDeepCompareMemoize({
    amount,
    currency,
    countryCode,
    paymentFlow,
  });

  // Track what we've fetched (instance + payload combo) to prevent duplicate fetches
  const lastFetchRef = useRef<{
    instance: typeof braintreePayPalCheckoutInstance;
    payload: typeof memoizedOptions;
  } | null>(null);

  // Prevents auto-retrying the exact (instance, payload) call that just failed.
  // Keyed on payload too so that changing options on the same failed instance
  // is still allowed to retry — a failed request shouldn't pin the hook in an
  // error state forever when the consumer corrects the input.
  const failedFetchRef = useRef<{
    instance: typeof braintreePayPalCheckoutInstance;
    payload: typeof memoizedOptions;
  } | null>(null);

  useEffect(() => {
    if (failedFetchRef.current?.instance !== braintreePayPalCheckoutInstance) {
      failedFetchRef.current = null;
    }

    if (!braintreePayPalCheckoutInstance) {
      return;
    }

    if (
      failedFetchRef.current?.instance === braintreePayPalCheckoutInstance &&
      failedFetchRef.current?.payload === memoizedOptions
    ) {
      return;
    }

    const hasFetchedThisConfig =
      lastFetchRef.current?.instance === braintreePayPalCheckoutInstance &&
      lastFetchRef.current?.payload === memoizedOptions;

    if (hasFetchedThisConfig) {
      return;
    }

    // Another hook instance (or earlier mount) may have already populated
    // eligibility on context with a deep-equal payload. If so, claim it as
    // ours and skip the network call. Use deepEqual instead of === because
    // separate hook mounts will memoize different references for the same
    // option values.
    if (
      eligibleMethodsRef.current &&
      lastFetchRef.current === null &&
      deepEqual(eligibleMethodsPayloadRef.current, memoizedOptions)
    ) {
      lastFetchRef.current = {
        instance: braintreePayPalCheckoutInstance,
        payload: memoizedOptions,
      };
      return;
    }

    lastFetchRef.current = {
      instance: braintreePayPalCheckoutInstance,
      payload: memoizedOptions,
    };

    let isSubscribed = true;
    let didSettle = false;
    setIsFetching(true);
    setError(null);

    braintreePayPalCheckoutInstance
      .findEligibleMethods(memoizedOptions)
      .then((result) => {
        if (!isSubscribed || !isMountedRef.current) {
          return;
        }
        dispatch({
          type: BRAINTREE_DISPATCH_ACTION.SET_ELIGIBILITY,
          value: {
            eligibleMethods: result,
            payload: memoizedOptions,
          },
        });
      })
      .catch((err: unknown) => {
        if (!isSubscribed || !isMountedRef.current) {
          return;
        }
        failedFetchRef.current = {
          instance: braintreePayPalCheckoutInstance,
          payload: memoizedOptions,
        };
        setError(err);
      })
      .finally(() => {
        // Mark the request as settled regardless of subscription so the
        // cleanup below knows it completed and should not roll back the dedup
        // marker.
        didSettle = true;
        if (!isSubscribed || !isMountedRef.current) {
          return;
        }
        setIsFetching(false);
      });

    return () => {
      isSubscribed = false;
      // If this fetch was torn down before it settled (e.g. a React 18
      // StrictMode mount/cleanup/mount cycle), clear the dedup marker so the
      // remount re-fetches. Without this, the remount sees lastFetchRef already
      // matching (instance, payload) and skips, while the only in-flight fetch
      // was just aborted — leaving the hook stuck with isPending=true forever.
      if (
        !didSettle &&
        lastFetchRef.current?.instance === braintreePayPalCheckoutInstance &&
        lastFetchRef.current?.payload === memoizedOptions
      ) {
        lastFetchRef.current = null;
      }
    };
  }, [
    braintreePayPalCheckoutInstance,
    memoizedOptions,
    dispatch,
    setError,
    isMountedRef,
  ]);

  // Cached eligibility is stale if it was fetched with a different payload than
  // the one currently requested. Normalize null/undefined so the deepEqual
  // doesn't treat "no stored payload" as different from "no provided payload".
  const isStaleData =
    !!eligibleMethods &&
    !deepEqual(
      eligibleMethodsPayload ?? undefined,
      memoizedOptions ?? undefined,
    );

  const isLoading =
    loadingStatus === INSTANCE_LOADING_STATE.PENDING ||
    isFetching ||
    (!eligibleMethods && !error) ||
    isStaleData;

  return {
    eligibleMethods,
    isLoading,
    error,
  };
}
