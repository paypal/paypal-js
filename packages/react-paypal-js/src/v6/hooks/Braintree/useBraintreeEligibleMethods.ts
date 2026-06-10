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
  eligiblePaymentMethods: BraintreeEligibilityResult | null;
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
 * `isLoading` is true while the provider's checkout instance is initializing
 * OR while eligibility is being fetched OR while the cached eligibility was
 * fetched with different options than the ones currently requested. It is
 * forced false whenever an error (fetch- or provider-level) is present.
 *
 * @example
 * function Checkout() {
 *   const { eligiblePaymentMethods, isLoading, error } = useBraintreeEligibleMethods({
 *     amount: "10.00",
 *     currency: "USD",
 *     countryCode: "US",
 *     paymentFlow: "ONE_TIME_PAYMENT",
 *   });
 *
 *   if (isLoading) return <Spinner />;
 *   if (error) return <ErrorMessage error={error} />;
 *
 *   return (
 *     <>
 *       {eligiblePaymentMethods?.paypal && <BraintreePayPalOneTimePaymentButton ... />}
 *       {eligiblePaymentMethods?.paylater && <PayPalPayLaterButton ... />}
 *     </>
 *   );
 * }
 */
export function useBraintreeEligibleMethods(
  options: UseBraintreeEligibleMethodsProps,
): UseBraintreeEligibleMethodsReturn {
  const {
    braintreePayPalCheckoutInstance,
    eligiblePaymentMethods,
    eligiblePaymentMethodsPayload,
    loadingStatus,
    error: contextError,
  } = useBraintreePayPal();
  const dispatch = useBraintreePayPalDispatch();
  const isMountedRef = useIsMountedRef();
  const [error, setError] = useError();
  const [isFetching, setIsFetching] = useState(false);

  // Refs let the effect see the latest context-cached eligibility without
  // adding it to the dep array (which would re-run the effect every time
  // *we* dispatch SET_ELIGIBILITY and re-trigger the fetch).
  const eligiblePaymentMethodsRef = useRef(eligiblePaymentMethods);
  const eligiblePaymentMethodsPayloadRef = useRef(
    eligiblePaymentMethodsPayload,
  );
  eligiblePaymentMethodsRef.current = eligiblePaymentMethods;
  eligiblePaymentMethodsPayloadRef.current = eligiblePaymentMethodsPayload;

  // Memoize the whole options object so every field the caller passes is
  // forwarded to findEligibleMethods. Don't destructure-and-rebuild a fixed
  // set of keys here — that would silently drop any field later added to
  // BraintreeFindEligibleMethodsOptions.
  const memoizedOptions = useDeepCompareMemoize(options);

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
      eligiblePaymentMethodsRef.current &&
      lastFetchRef.current === null &&
      deepEqual(eligiblePaymentMethodsPayloadRef.current, memoizedOptions)
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
            eligiblePaymentMethods: result,
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
      // was just aborted — leaving the hook stuck with isLoading=true forever.
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
    !!eligiblePaymentMethods &&
    !deepEqual(
      eligiblePaymentMethodsPayload ?? undefined,
      memoizedOptions ?? undefined,
    );

  const isLoading =
    !error &&
    (loadingStatus === INSTANCE_LOADING_STATE.PENDING ||
      isFetching ||
      !eligiblePaymentMethods ||
      isStaleData);

  // Provider-level failures (e.g. the checkout instance failed to initialize)
  // are surfaced in their own return and labeled, distinct from fetch-level
  // errors, so the developer can tell which layer failed — rather than merging
  // both into a single error.
  if (contextError) {
    return {
      eligiblePaymentMethods,
      isLoading: false,
      error: new Error(`Braintree PayPal context error: ${contextError}`),
    };
  }

  return {
    eligiblePaymentMethods,
    isLoading,
    error,
  };
}
