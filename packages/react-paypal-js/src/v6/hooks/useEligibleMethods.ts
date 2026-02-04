import { useEffect, useRef, useState } from "react";

import { usePayPal } from "./usePayPal";
import { usePayPalDispatch } from "./usePayPalDispatch";
import {
    INSTANCE_DISPATCH_ACTION,
    type Components,
    type EligiblePaymentMethodsOutput,
    type FindEligibleMethodsOptions,
    type SdkInstance,
} from "../types";
import { useError } from "./useError";

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
    const fetchedForInstanceRef = useRef<SdkInstance<
        readonly [Components, ...Components[]]
    > | null>(null);

    // todo
    // add doc comments
    // open PR
    // make PR description

    useEffect(() => {
        // Only fetch if:
        // 1. sdkInstance is available
        // 2. eligiblePaymentMethods not in context
        // 3. Haven't already fetched for THIS sdkInstance
        if (!sdkInstance) {
            return;
        }
        if (eligiblePaymentMethods) {
            return;
        }
        if (fetchedForInstanceRef.current === sdkInstance) {
            return;
        }

        // Mark that we're fetching for this instance
        fetchedForInstanceRef.current = sdkInstance;

        let isSubscribed = true;
        setIsFetching(true);

        sdkInstance
            .findEligibleMethods(payload ?? {})
            .then((result) => {
                if (isSubscribed) {
                    dispatch({
                        type: INSTANCE_DISPATCH_ACTION.SET_ELIGIBILITY,
                        value: result,
                    });
                }
            })
            .catch((err) => {
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
            isSubscribed = false;
        };
    }, [sdkInstance, eligiblePaymentMethods, payload, dispatch, setError]);

    if (contextError) {
        return {
            eligiblePaymentMethods,
            isLoading: isFetching,
            error: new Error(`PayPal context error: ${contextError.message}`, {
                cause: contextError,
            }),
        };
    }

    return {
        eligiblePaymentMethods,
        isLoading: isFetching,
        error: eligibilityError,
    };
}
