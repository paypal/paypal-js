import { useState, useEffect, useRef } from "react";

import type {
    EligiblePaymentMethods,
    PayLaterCountryCodes,
    PayLaterProductCodes,
    PayPalCreditCountryCodes,
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

type FindEligiblePaymentMethodsRequestPayload = {
    customer?: {
        // the user agent string is used by default for requests made from the browser
        channel?: {
            browser_type?: string;
            client_os?: string;
            device_type?: string;
        };
        // the pp_geo_loc header value is used by default for requests made from the browser
        country_code?: string;
        id?: string;
        email?: string;
        phone?: PhoneNumber;
    };
    purchase_units?: ReadonlyArray<{
        amount: {
            currency_code: string;
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
    clientToken: string;
    eligibleMethodsResponse?: FindEligiblePaymentMethodsResponse;
    payload?: FindEligiblePaymentMethodsRequestPayload;
};

type EligiblePaymentMethodDetails = {
    can_be_vaulted?: boolean;
    eligible_in_paypal_network?: boolean;
    recommended?: boolean;
    recommended_priority?: number;
    country_code?: PayLaterCountryCodes | PayPalCreditCountryCodes;
    product_code?: PayLaterProductCodes;
};

export type FindEligiblePaymentMethodsResponse = {
    eligible_methods: {
        [key in EligiblePaymentMethods]?: EligiblePaymentMethodDetails;
    };
    supplementary_data?: {
        buyer_country_code?: string;
    };
};

export async function fetchEligibleMethods(
    options: FindEligiblePaymentMethodsOptions,
): Promise<FindEligiblePaymentMethodsResponse> {
    const { clientToken, payload } = options;

    try {
        const response = await fetch(
            "https://api-m.sandbox.paypal.com/v2/payments/find-eligible-methods",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${clientToken}`,
                    Accept: "application/json",
                    "Accept-Language": "en-US,en;q=0.9",
                },
                body: JSON.stringify(payload),
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
}: FindEligiblePaymentMethodsOptions): {
    eligibleMethods: any;
    isLoading: boolean;
    error: Error | null;
} {
    const [eligibleMethods, setEligibleMethods] =
        useState<FindEligiblePaymentMethodsResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const payloadRef = useRef(payload);
    const eligibleMethodsResponseRef = useRef(eligibleMethodsResponse);

    console.log("hook firing");

    useEffect(() => {
        if (!eligibleMethodsResponseRef.current && !clientToken) {
            setError(
                new Error(
                    "clientToken is required when eligibleMethodsResponse is not provided",
                ),
            );
        }
    }, [clientToken]);

    useEffect(() => {
        if (eligibleMethodsResponseRef.current) {
            setEligibleMethods(eligibleMethodsResponseRef.current);
            setIsLoading(false);
            return;
        }

        if (!clientToken) {
            return;
        }

        async function getEligibility() {
            try {
                const methods = await fetchEligibleMethods({
                    clientToken,
                    payload: payloadRef.current,
                });
                setEligibleMethods(methods);
                setIsLoading(false);
            } catch (error) {
                setError(
                    error instanceof Error ? error : new Error(String(error)),
                );
                setIsLoading(false);
            }
        }
        console.log("useEffect body running");
        getEligibility();
    }, [clientToken]);

    return { eligibleMethods, isLoading, error };
}
