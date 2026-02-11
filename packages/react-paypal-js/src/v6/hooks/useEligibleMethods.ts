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
        error: contextError,
    } = usePayPal();
    const dispatch = usePayPalDispatch();
    const [eligibilityError, setError] = useError();
    const [isFetching, setIsFetching] = useState(false);

    // Memoize payload to avoid unnecessary re-fetches when object reference changes
    const memoizedPayload = useDeepCompareMemoize(payload);

    // Track what we've fetched (instance + payload combo) to prevent duplicate fetches
    const lastFetchRef = useRef<{
        instance: typeof sdkInstance;
        payload: typeof memoizedPayload;
    } | null>(null);

    useEffect(() => {
        // Only fetch if:
        // 1. sdkInstance is available
        // 2. Haven't already fetched for THIS sdkInstance with THIS payload
        // 3. Eligibility not already in context (from server hydration or another fetch)
        //    UNLESS the payload has changed from what was used to fetch it
        console.log("[useEligibleMethods] Effect running", {
            sdkInstance: !!sdkInstance,
            lastFetchRef: lastFetchRef.current,
            eligiblePaymentMethods: !!eligiblePaymentMethods,
        });

        if (!sdkInstance) {
            console.log("[useEligibleMethods] No sdkInstance, returning");
            return;
        }

        const hasFetchedThisConfig =
            lastFetchRef.current?.instance === sdkInstance &&
            lastFetchRef.current?.payload === memoizedPayload;

        // Skip if we already fetched with this exact config
        if (hasFetchedThisConfig) {
            console.log(
                "[useEligibleMethods] Already fetched this config, returning",
            );
            return;
        }

        // If eligibility exists and we haven't fetched anything yet (e.g., server hydration),
        // mark as fetched to avoid unnecessary re-fetch with same payload
        if (eligiblePaymentMethods && lastFetchRef.current === null) {
            console.log(
                "[useEligibleMethods] Eligibility exists from hydration, marking as fetched",
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

        let isSubscribed = true;
        setIsFetching(true);
        console.log("[useEligibleMethods] Starting fetch");

        sdkInstance
            .findEligibleMethods(memoizedPayload ?? {})
            .then((result) => {
                console.log("[useEligibleMethods] Fetch completed", {
                    isSubscribed,
                    result: !!result,
                });
                if (isSubscribed) {
                    console.log(
                        "[useEligibleMethods] Dispatching SET_ELIGIBILITY",
                    );
                    dispatch({
                        type: INSTANCE_DISPATCH_ACTION.SET_ELIGIBILITY,
                        value: result,
                    });
                } else {
                    console.log(
                        "[useEligibleMethods] Skipping dispatch - isSubscribed is false",
                    );
                }
            })
            .catch((err) => {
                console.log("[useEligibleMethods] Fetch error", {
                    isSubscribed,
                    err,
                });
                if (isSubscribed) {
                    setError(err);
                }
            })
            .finally(() => {
                console.log("[useEligibleMethods] Finally block", {
                    isSubscribed,
                });
                setIsFetching(false);
                // if (isSubscribed) {
                //     setIsFetching(false);
                // } else {
                //     console.log(
                //         "[useEligibleMethods] NOT setting isFetching=false because isSubscribed is false",
                //     );
                // }
            });

        return () => {
            isSubscribed = false;
            lastFetchRef.current = null; // Reset fetch tracking on unmount or dependency change
            console.log(
                "[useEligibleMethods] Cleanup running, setting isSubscribed=false and lastFetchRef.current=null",
                lastFetchRef.current,
            );
        };
    }, [
        sdkInstance,
        memoizedPayload,
        eligiblePaymentMethods,
        dispatch,
        setError,
    ]);

    if (contextError) {
        return {
            eligiblePaymentMethods,
            isLoading: isFetching,
            error: new Error(`PayPal context error: ${contextError}`),
        };
    }

    return {
        eligiblePaymentMethods,
        isLoading: isFetching,
        error: eligibilityError,
    };
}
