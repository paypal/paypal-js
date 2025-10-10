import { PayPalPaymentsInstance } from "./components/paypal-payments";
import { PayPalLegacyBillingInstance } from "./components/paypal-legacy-billing-agreements";
import { VenmoPaymentsInstance } from "./components/venmo-payments";
import {
    EligiblePaymentMethodsOutput,
    FindEligibleMethodsOptions,
} from "./components/find-eligible-methods";

export interface PayPalV6Namespace {
    /**
     * Creates an SDK instance, which is the first step in an SDK integration. This instance serves as the base layer for all SDK components.
     *
     * This is an asynchronous method that initializes the PayPal SDK with the provided
     * client token and components.
     *
     * @param createInstanceOptions - Configuration options for creating the SDK instance
     * @returns A promise that resolves to an SDK instance with methods based on the specified components
     *
     * @example
     * ```typescript
     * const sdkInstance = await window.paypal.createInstance({
     *   clientToken: "your-client-token",
     *   components: ["paypal-payments"],
     *   locale: "en-US",
     *   pageType: "checkout"
     * });
     * ```
     */
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
    /**
     * Checks eligibility for specific payment methods.
     *
     * This method verifies buyer and merchant eligibility by interacting with PayPal's
     * public API to determine whether payment methods (such as PayPal or Venmo) can be used.
     * Use this to conditionally render the appropriate payment buttons on your site.
     *
     * @param findEligibleMethodsOptions - Options for checking payment method eligibility
     * @returns A promise that resolves to payment methods eligibility information
     *
     * @example
     * ```typescript
     * const paymentMethods = await sdkInstance.findEligibleMethods();
     * const isPayPalEligible = paymentMethods.isEligible("paypal");
     * if (isPayPalEligible) {
     *   // Render PayPal button
     * }
     * ```
     */
    findEligibleMethods: (
        findEligibleMethodsOptions: FindEligibleMethodsOptions,
    ) => Promise<EligiblePaymentMethodsOutput>;
    /**
     * Updates the locale for the SDK instance.
     *
     * This method allows you to dynamically change the locale of the SDK instance
     * after it has been initialized. The locale should be specified using a BCP-47 code.
     *
     * @param locale - The new locale to set, specified as a BCP-47 code (e.g., "en-US", "es-ES")
     * @returns void
     *
     * @example
     * ```typescript
     * sdkInstance.updateLocale("es-ES");
     * ```
     */
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
