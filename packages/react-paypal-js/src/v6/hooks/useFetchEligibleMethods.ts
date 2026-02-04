import {
    type EligiblePaymentMethods,
    type FindEligiblePaymentMethodsResponse,
} from "../types";

type FindEligiblePaymentMethodsOptions = {
    clientToken?: string;
    environment?: "production" | "sandbox";
    payload?: FindEligiblePaymentMethodsRequestPayload;
};

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
export async function useFetchEligibleMethods(
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
