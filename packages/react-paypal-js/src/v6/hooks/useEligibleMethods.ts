import { useEffect, useRef, useState } from "react";

import { usePayPal } from "./usePayPal";
import { usePayPalDispatch } from "./usePayPalDispatch";
import {
    INSTANCE_DISPATCH_ACTION,
    INSTANCE_LOADING_STATE,
    type Components,
    type EligiblePaymentMethods,
    type EligiblePaymentMethodsOutput,
    type FindEligibleMethodsOptions,
    type FindEligiblePaymentMethodsResponse,
    type SdkInstance,
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

export function useEligibleMethods(): {
    eligiblePaymentMethods: EligiblePaymentMethodsOutput | null;
    isLoading: boolean;
    error: Error | null;
} {
    const { loadingStatus, eligiblePaymentMethods, error } = usePayPal();

    return {
        eligiblePaymentMethods,
        isLoading: loadingStatus === INSTANCE_LOADING_STATE.PENDING,
        error,
    };
}

export interface UseFetchEligibleMethodsOptions {
    payload?: FindEligibleMethodsOptions;
}

export interface UseFetchEligibleMethodsResult {
    eligiblePaymentMethods: EligiblePaymentMethodsOutput | null;
    isLoading: boolean;
    isFetching: boolean;
    error: Error | null;
}

export function useFetchEligibleMethods(
    options: UseFetchEligibleMethodsOptions = {},
): UseFetchEligibleMethodsResult {
    const { payload } = options;
    const { sdkInstance, loadingStatus, eligiblePaymentMethods } = usePayPal();
    const dispatch = usePayPalDispatch();
    const [error, setError] = useError();
    const [isFetching, setIsFetching] = useState(false);
    const fetchedForInstanceRef = useRef<SdkInstance<
        readonly [Components, ...Components[]]
    > | null>(null);

    const isLoading = loadingStatus === INSTANCE_LOADING_STATE.PENDING;

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

    return {
        eligiblePaymentMethods,
        isLoading,
        isFetching,
        error,
    };
}
