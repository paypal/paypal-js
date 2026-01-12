import { useState, useEffect } from "react";

import { useDeepCompareMemoize } from "../utils";
import { useError } from "./useError";

import type {
    EligiblePaymentMethods,
    FindEligiblePaymentMethodsResponse,
} from "../types";

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
    eligibleMethodsResponse?: FindEligiblePaymentMethodsResponse;
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

export function useEligibleMethods({
    eligibleMethodsResponse,
    clientToken,
    payload,
    environment,
}: FindEligiblePaymentMethodsOptions): {
    eligibleMethods: FindEligiblePaymentMethodsResponse | null;
    isLoading: boolean;
    error: Error | null;
} {
    const [eligibleMethods, setEligibleMethods] =
        useState<FindEligiblePaymentMethodsResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useError();
    const memoizedPayload = useDeepCompareMemoize(payload);
    const memoizedEligibleMethodsResponse = useDeepCompareMemoize(
        eligibleMethodsResponse,
    );

    useEffect(() => {
        const abortController = new AbortController();
        let isSubscribed = true;

        if (memoizedEligibleMethodsResponse) {
            setEligibleMethods(memoizedEligibleMethodsResponse);
            setIsLoading(false);
            return;
        }

        // Wait for clientToken to be available before fetching eligibility
        // This allows the provider to render while the token is being fetched
        if (!clientToken) {
            setIsLoading(true);
            return;
        }

        async function getEligibility() {
            setError(null);
            setIsLoading(true);

            try {
                const methods = await fetchEligibleMethods({
                    clientToken,
                    payload: memoizedPayload,
                    signal: abortController.signal,
                    environment,
                });

                if (isSubscribed) {
                    setEligibleMethods(methods);
                    setIsLoading(false);
                }
            } catch (error) {
                if (
                    isSubscribed &&
                    !(error instanceof Error && error.name === "AbortError")
                ) {
                    setError(
                        error instanceof Error
                            ? error
                            : new Error(String(error)),
                    );
                    setIsLoading(false);
                }
            }
        }

        getEligibility();

        return () => {
            isSubscribed = false;
            abortController.abort();
        };
    }, [
        clientToken,
        memoizedPayload,
        memoizedEligibleMethodsResponse,
        environment,
        setError,
    ]);

    return { eligibleMethods, isLoading, error };
}
