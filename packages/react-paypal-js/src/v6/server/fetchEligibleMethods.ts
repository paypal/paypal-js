import "server-only";
import {
  type EligiblePaymentMethods,
  type FindEligiblePaymentMethodsResponse,
} from "../types";

type FindEligiblePaymentMethodsOptions = {
  environment: "production" | "sandbox";
  payload?: FindEligiblePaymentMethodsRequestPayload;
  headers?: HeadersInit;
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
  merchant_info?: {
    /**
     * The merchant's checkout domain as a bare hostname — NO scheme, NO port
     * (e.g. `checkout.example.com`). Google Pay validates this against the
     * registered domain; a scheme or port causes OR_BIBED_06.
     * `fetchEligibleMethods` normalizes this to a hostname before sending.
     */
    merchant_origin?: string;
  };
};

/**
 * Reduce a `merchant_origin` to a bare hostname (no scheme, no port). Google Pay
 * (and other domain-bound methods) validate it against the registered domain, and
 * a scheme/port gets signed into the Google Pay authJwt and rejected by Google
 * (OR_BIBED_06). If the value can't be parsed, return it unchanged and let the API
 * validate it.
 */
function toHostname(value: string): string {
  try {
    const hasScheme = /^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(value);
    return new URL(hasScheme ? value : `https://${value}`).hostname;
  } catch {
    return value;
  }
}

/** Return a copy of `payload` with `merchant_info.merchant_origin` normalized to a hostname. */
function normalizeMerchantOrigin(
  payload: FindEligiblePaymentMethodsRequestPayload,
): FindEligiblePaymentMethodsRequestPayload {
  const origin = payload.merchant_info?.merchant_origin;
  if (origin === undefined) {
    return payload;
  }
  return {
    ...payload,
    merchant_info: {
      ...payload.merchant_info,
      merchant_origin: toHostname(origin),
    },
  };
}

/**
 * Server-side function to fetch eligible payment methods from the PayPal API.
 *
 * Use this in server environments (Next.js server components, Remix loaders, etc.)
 * to pre-fetch eligibility data before hydrating the client. Pass the response
 * to the `PayPalProvider` via the `eligibleMethodsResponse` prop.
 *
 * @param options - Configuration for the eligibility request
 * @param options.headers - HTTP headers for the request, including the `Authorization` bearer token
 * @param options.environment - Target environment ("sandbox" or "production")
 * @param options.payload - Optional request payload with customer/purchase details
 * @param options.signal - Optional AbortSignal for request cancellation
 * @returns Promise resolving to the eligibility API response
 *
 * @example
 * // Next.js server component
 * const response = await fetchEligibleMethods({
 *     headers: {
 *         "Content-Type": "application/json",
 *         Authorization: `Bearer ${clientToken}`,
 *     },
 *     environment: "sandbox",
 *     payload: { purchase_units: [{ amount: { currency_code: "USD" } }] },
 * });
 *
 * <PayPalProvider eligibleMethodsResponse={response} ... />
 */
export async function fetchEligibleMethods(
  options: FindEligiblePaymentMethodsOptions & { signal?: AbortSignal },
): Promise<FindEligiblePaymentMethodsResponse> {
  const { payload, signal, environment, headers } = options;

  if (environment !== "production" && environment !== "sandbox") {
    throw new Error(
      'The "environment" option is required and must be either "production" or "sandbox"',
    );
  }

  const defaultPayload = normalizeMerchantOrigin(payload ?? {});
  const baseUrl =
    environment === "production"
      ? "https://api-m.paypal.com"
      : "https://api-m.sandbox.paypal.com";
  try {
    const response = await fetch(
      `${baseUrl}/v2/payments/find-eligible-methods`,
      {
        method: "POST",
        headers,
        body: JSON.stringify(defaultPayload),
        signal,
      },
    );

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Eligibility API error: ${response.status} - ${body}`);
    }

    const data = await response.json();

    return data;
  } catch (error) {
    throw new Error(
      `Failed to fetch eligible methods: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

/**
 * @deprecated Renamed to `fetchEligibleMethods`. This is a server-side async
 * function, not a React hook — the `use` prefix falsely triggers
 * eslint-plugin-react-hooks (`rules-of-hooks` / `no-unnecessary-use-prefix`)
 * in consumer projects. Import `fetchEligibleMethods` instead.
 */
export const useFetchEligibleMethods = fetchEligibleMethods;
