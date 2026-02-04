import { useEffect, useRef, useState } from "react";

import { usePayPal } from "./usePayPal";
import { usePayPalDispatch } from "./usePayPalDispatch";
import {
    INSTANCE_DISPATCH_ACTION,
    type Components,
    type EligiblePaymentMethods,
    type EligiblePaymentMethodsOutput,
    type FindEligibleMethodsOptions,
    type FindEligiblePaymentMethodsResponse,
    type SdkInstance,
    // INSTANCE_LOADING_STATE,
} from "../types";
import { useError } from "./useError";

type PhoneNumber = {
    country_code?: string;
    national_number?: string;
};

type PaymentFlow =
    | "ONE_TIME_PAYMENT"
    | "RECURRING_PAYMENT"
    | "VAULT_WITHOUT_PAYMENT"
    | "VAULT_WITH_PAYMENT";

export type FindEligiblePaymentMethodsRequestPayload = {
    customer?: {
        channel?: {
            browser_type?: string;
            client_os?: string;
            device_type?: string;
        };
        country_code?: string;
        id?: string;
        email?: string;
        phone?: PhoneNumber;
    };
    purchase_units?: ReadonlyArray<{
        amount: {
            currency_code: string;
            value?: string;
        };
        payee?: {
            client_id?: string;
            display_data?: {
                business_email?: string;
                business_phone?: PhoneNumber & {
                    extension_number: string;
                };
                brand_name?: string;
            };
            email_address?: string;
            merchant_id?: string;
        };
    }>;
    preferences?: {
        // runs advanced customer eligibility checks when set to true
        include_account_details?: boolean;
        include_vault_tokens?: boolean;
        payment_flow?: PaymentFlow;
        payment_source_constraint?: {
            constraint_type: string;
            payment_sources: Uppercase<EligiblePaymentMethods>[];
        };
    };
    shopper_session_id?: string;
};

type FindEligiblePaymentMethodsOptions = {
    clientToken?: string;
    environment?: "production" | "sandbox";
    payload?: FindEligiblePaymentMethodsRequestPayload;
};

/**
 * Server-side function to fetch eligible payment methods from the PayPal API.
 *
 * Use this in server environments (Next.js server components, Remix loaders, etc.)
 * to pre-fetch eligibility data before hydrating the client. Pass the response
 * to {@link PayPalProvider} via the `eligibleMethodsResponse` prop.
 *
 * @param options - Configuration for the eligibility request
 * @param options.clientToken - Bearer token for API authentication
 * @param options.environment - Target environment ("sandbox" or "production")
 * @param options.payload - Optional request payload with customer/purchase details
 * @param options.signal - Optional AbortSignal for request cancellation
 * @returns Promise resolving to the eligibility API response
 *
 * @example
 * // Next.js server component
 * const response = await fetchEligibleMethods({
 *     clientToken: token,
 *     environment: "sandbox",
 *     payload: { purchase_units: [{ amount: { currency_code: "USD" } }] }
 * });
 *
 * <PayPalProvider eligibleMethodsResponse={response} ... />
 */
export async function fetchEligibleMethods(
    options: FindEligiblePaymentMethodsOptions & { signal?: AbortSignal },
): Promise<FindEligiblePaymentMethodsResponse> {
    const { clientToken, payload, signal, environment } = options;
    const defaultPayload = payload ?? {};
    const baseUrl =
        environment === "production"
            ? "https://api-m.paypal.com"
            : "https://api-m.sandbox.paypal.com";
    try {
        const response = await fetch(
            `${baseUrl}/v2/payments/find-eligible-methods`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${clientToken}`,
                    Accept: "application/json",
                    "Accept-Language": "en-US,en;q=0.9",
                },
                body: JSON.stringify(defaultPayload),
                signal,
            },
        );

        if (!response.ok) {
            throw new Error(`Eligibility API error: ${response.status}`);
        }

        const data = await response.json();

        return data;
    } catch (error) {
        throw new Error(
            `Failed to fetch eligible methods: ${error instanceof Error ? error.message : String(error)}`,
        );
    }
}

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
