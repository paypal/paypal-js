import { PayPalPaymentsInstance } from "./components/paypal-payments";
import { PayPalLegacyBillingInstance } from "./components/paypal-legacy-billing-agreements";
import { VenmoPaymentsInstance } from "./components/venmo-payments";
import {
    EligiblePaymentMethodsOutput,
    FindEligibleMethodsOptions,
} from "./components/find-eligible-methods";

export interface PayPalV6Namespace {
    createInstance: <T extends readonly [Components, ...Components[]]>(
        createInstanceOptions: CreateInstanceOptions<T>,
    ) => Promise<SdkInstance<T>>;
}

export type Components =
    | "paypal-payments"
    | "venmo-payments"
    | "paypal-legacy-billing-agreements";

export type PageTypes =
    | "cart"
    | "checkout"
    | "home"
    | "mini-cart"
    | "product-details"
    | "product-listing"
    | "search-results";

export type CreateInstanceOptions<T extends readonly Components[]> = {
    clientMetadataId?: string;
    clientToken: string;
    components: T;
    locale?: string;
    pageType?: PageTypes;
    partnerAttributionId?: string;
    shopperSessionId?: string;
    testBuyerCountry?: string;
};

/**
 * Dynamically typed SDK instance based on the components array provided to createInstance.
 *
 * The return type changes based on which components are specified in the components array.
 *
 * **Always includes:**
 * - `findEligibleMethods()` - Base method available regardless of components
 *
 * **Conditionally includes methods based on components:**
 * - `"paypal-payments"` - Adds PayPalPaymentsInstance methods
 * - `"venmo-payments"` - Adds VenmoPaymentsInstance methods
 * - `"paypal-legacy-billing-agreements"` Adds PayPalLegacyBillingInstance methods
 *
 * @example
 * ```typescript
 * // Only PayPal methods + base methods
 * const sdkInstance = await createInstance({
 *   clientToken: "token",
 *   components: ["paypal-payments"]
 * });
 * sdkInstance.createPayPalOneTimePaymentSession(...); // ✅ Available
 * sdkInstance.createVenmoOneTimePaymentSession(...);  // ❌ TypeScript error
 *
 * // Multiple components
 * const sdkInstance = await createInstance({
 *   clientToken: "token",
 *   components: ["paypal-payments", "venmo-payments"]
 * });
 * sdkInstance.createPayPalOneTimePaymentSession(...); // ✅ Available
 * sdkInstance.createVenmoOneTimePaymentSession(...);  // ✅ Available
 * ```
 */

export type SdkInstance<T extends readonly [Components, ...Components[]]> =
    BaseInstance &
        ("paypal-payments" extends T[number]
            ? PayPalPaymentsInstance
            : unknown) &
        ("venmo-payments" extends T[number] ? VenmoPaymentsInstance : unknown) &
        ("paypal-legacy-billing-agreements" extends T[number]
            ? PayPalLegacyBillingInstance
            : unknown);

export interface BaseInstance {
    findEligibleMethods: (
        findEligibleMethodsOptions: FindEligibleMethodsOptions,
    ) => Promise<EligiblePaymentMethodsOutput>;
    updateLocale: (locale: string) => void;
}

export type LoadCoreSdkScriptOptions = {
    environment?: "production" | "sandbox";
    debug?: boolean;
};

export function loadCoreSdkScript(
    options: LoadCoreSdkScriptOptions,
): Promise<PayPalV6Namespace>;

// Components
export * from "./components/paypal-payments";
export * from "./components/paypal-legacy-billing-agreements";
export * from "./components/venmo-payments";
export * from "./components/find-eligible-methods";

// export a subset of types from base-component
export {
    OnApproveDataOneTimePayments,
    OnCompleteData,
    OnErrorData,
} from "./components/base-component";
