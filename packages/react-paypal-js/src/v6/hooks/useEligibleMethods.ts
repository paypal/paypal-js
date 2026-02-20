import { useEffect, useRef, useState } from "react";

import { usePayPal } from "./usePayPal";
import { usePayPalDispatch } from "./usePayPalDispatch";
import {
    INSTANCE_DISPATCH_ACTION,
    type EligiblePaymentMethodsOutput,
    type FindEligibleMethodsOptions,
} from "../types";
import { useError } from "./useError";
import { useDeepCompareMemoize } from "../utils";

export interface UseFetchEligibleMethodsOptions {
    payload?: FindEligibleMethodsOptions;
}

export interface UseFetchEligibleMethodsResult {
    eligiblePaymentMethods: EligiblePaymentMethodsOutput | null;
    isLoading: boolean;
    error: Error | null;
}

/**
 * Client-side hook to access eligible payment methods from the PayPal context.
 *
 * This hook handles both server-hydrated and client-fetch scenarios:
 * - If eligibility was pre-fetched server-side, returns it immediately
 * - If not present, fetches via the SDK and stores in context
 * - Prevents duplicate API calls across components
 *
 * @param options - Configuration for the eligibility request
 * @param options.payload - Optional request payload with customer/purchase details
 * @returns Object containing eligibility state
 * @returns eligiblePaymentMethods - The eligible payment methods
 * @returns isLoading - True while fetching eligibility
 * @returns error - Any error that occurred during the fetch
 *
 * @example
 * function Checkout({props}) {
 *     const { handleClick } = usePayLaterOneTimePaymentSession(props);
 *     const { eligiblePaymentMethods, isLoading, error } = useEligibleMethods({
 *         payload: { purchase_units: [{ amount: { currency_code: "USD" } }] }
 *     });
 *
 *     const payLaterDetails = eligiblePaymentMethods?.getDetails?.("paylater");
 *     const countryCode = payLaterDetails?.countryCode;
 *     const productCode = payLaterDetails?.productCode;
 *
 *     if (isLoading) return <Spinner />;
 *     if (error) return <Error message={error.message} />;
 *     return (
 *       <paypal-pay-later-button
 *          handleClick={handleClick}
 *          countryCode={countryCode}
 *          productCode={productCode}
 *       />
 *      );
 * }
 */
export function useEligibleMethods(
    options: UseFetchEligibleMethodsOptions = {},
): UseFetchEligibleMethodsResult {
    const { payload } = options;
    const {
        sdkInstance,
        eligiblePaymentMethods,
        eligiblePaymentMethodsPayload,
        error: contextError,
    } = usePayPal();
    const dispatch = usePayPalDispatch();
    const [eligibilityError, setError] = useError();
    const [isFetching, setIsFetching] = useState(false);

    // Use ref to access eligiblePaymentMethods in effect without adding to deps
    const eligiblePaymentMethodsRef = useRef(eligiblePaymentMethods);
    const eligiblePaymentMethodsPayloadRef = useRef(
        eligiblePaymentMethodsPayload,
    );
    eligiblePaymentMethodsRef.current = eligiblePaymentMethods;
    eligiblePaymentMethodsPayloadRef.current = eligiblePaymentMethodsPayload;

    // Memoize payload to avoid unnecessary re-fetches when object reference changes
    const memoizedPayload = useDeepCompareMemoize(payload);

    // DEBUG: Log payload memoization
    console.log("[useEligibleMethods] payload input:", JSON.stringify(payload));
    console.log(
        "[useEligibleMethods] memoizedPayload:",
        JSON.stringify(memoizedPayload),
    );
    console.log(
        "[useEligibleMethods] payload === memoizedPayload (reference):",
        payload === memoizedPayload,
    );

    // Track what we've fetched (instance + payload combo) to prevent duplicate fetches
    const lastFetchRef = useRef<{
        instance: typeof sdkInstance;
        payload: typeof memoizedPayload;
    } | null>(null);

    useEffect(() => {
        console.log("[useEligibleMethods] useEffect triggered");
        console.log(
            "[useEligibleMethods] sdkInstance:",
            sdkInstance ? "exists" : "null",
        );
        console.log(
            "[useEligibleMethods] memoizedPayload in effect:",
            JSON.stringify(memoizedPayload),
        );
        console.log(
            "[useEligibleMethods] lastFetchRef.current:",
            lastFetchRef.current
                ? {
                      instance: lastFetchRef.current.instance
                          ? "exists"
                          : "null",
                      payload: JSON.stringify(lastFetchRef.current.payload),
                  }
                : "null",
        );
        console.log(
            "[useEligibleMethods] eligiblePaymentMethodsRef.current:",
            eligiblePaymentMethodsRef.current ? "exists" : "null",
        );

        // Only fetch if:
        // 1. sdkInstance is available
        // 2. Haven't already fetched for THIS sdkInstance with THIS payload
        // 3. Eligibility not already in context (from server hydration or another fetch)
        //    UNLESS the payload has changed from what was used to fetch it
        if (!sdkInstance) {
            console.log("[useEligibleMethods] SKIP: no sdkInstance");
            return;
        }

        const hasFetchedThisConfig =
            lastFetchRef.current?.instance === sdkInstance &&
            lastFetchRef.current?.payload === memoizedPayload;

        console.log(
            "[useEligibleMethods] hasFetchedThisConfig:",
            hasFetchedThisConfig,
        );
        console.log(
            "[useEligibleMethods] lastFetchRef.current?.instance === sdkInstance:",
            lastFetchRef.current?.instance === sdkInstance,
        );
        console.log(
            "[useEligibleMethods] lastFetchRef.current?.payload === memoizedPayload:",
            lastFetchRef.current?.payload === memoizedPayload,
        );

        // Skip if we already fetched with this exact config
        if (hasFetchedThisConfig) {
            console.log(
                "[useEligibleMethods] SKIP: already fetched this config",
            );
            return;
        }

        // If eligibility exists and we haven't fetched anything yet (e.g., server hydration),
        // mark as fetched to avoid unnecessary re-fetch with same payload
        if (
            eligiblePaymentMethodsRef.current && // eligibility data exists
            lastFetchRef.current === null && // but we haven't recorded any fetch yet
            // what about if the payload has changed reducer payload vs memoized payload
            eligiblePaymentMethodsPayloadRef.current === memoizedPayload // and the existing eligibility data matches the current payload
        ) {
            console.log(
                "[useEligibleMethods] SKIP: server hydration case - marking as fetched without API call",
            );
            lastFetchRef.current = {
                instance: sdkInstance,
                payload: memoizedPayload,
            };
            return;
        }

        // Mark as fetched before starting
        lastFetchRef.current = {
            instance: sdkInstance,
            payload: memoizedPayload,
        };

        console.log(
            "[useEligibleMethods] FETCHING: making API call with payload:",
            JSON.stringify(memoizedPayload),
        );

        let isSubscribed = true;
        setIsFetching(true);

        sdkInstance
            .findEligibleMethods(memoizedPayload)
            .then((result) => {
                console.log(
                    "[useEligibleMethods] API call SUCCESS, isSubscribed:",
                    isSubscribed,
                );
                if (isSubscribed) {
                    dispatch({
                        type: INSTANCE_DISPATCH_ACTION.SET_ELIGIBILITY,
                        value: {
                            eligiblePaymentMethods: result,
                            payload: memoizedPayload,
                        },
                    });
                }
            })
            .catch((err) => {
                console.log("[useEligibleMethods] API call ERROR:", err);
                if (isSubscribed) {
                    setError(err);
                }
            })
            .finally(() => {
                if (isSubscribed) {
                    setIsFetching(false);
                }
            });

        return () => {
            console.log("[useEligibleMethods] CLEANUP: effect cleanup running");
            isSubscribed = false;
            lastFetchRef.current = null; // Reset fetch tracking on unmount or dependency change
        };
    }, [sdkInstance, memoizedPayload, dispatch, setError]);

    // isLoading should be true if:
    // 1. We're actively fetching, OR
    // 2. We don't have eligibility data yet and no error occurred
    // This prevents a flash where isLoading=false before the effect runs
    const isLoading =
        isFetching || (!eligiblePaymentMethods && !eligibilityError);

    if (contextError) {
        return {
            eligiblePaymentMethods,
            isLoading,
            error: new Error(`PayPal context error: ${contextError}`),
        };
    }

    return {
        eligiblePaymentMethods,
        isLoading,
        error: eligibilityError,
    };
}
