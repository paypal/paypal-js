import { usePayPal } from "../hooks/usePayPal";
import {
    INSTANCE_LOADING_STATE,
    type EligiblePaymentMethods,
    type EligiblePaymentMethodsOutput,
    type FindEligiblePaymentMethodsResponse,
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
