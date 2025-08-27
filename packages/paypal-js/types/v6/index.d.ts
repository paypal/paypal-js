import {
    PayLaterOneTimePaymentSessionOptions,
    PayPalCreditOneTimePaymentSessionOptions,
    PayPalOneTimePaymentSessionOptions,
    SavePaymentSessionOptions,
} from "./components/paypal-payments";
import { BillingSessionOptions } from "./components/paypal-legacy-billing-agreements";
import { VenmoPaymentSessionOptions } from "./components/venmo-payments";
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
export type SdkInstance<T extends readonly Components[]> = BaseInstance &
    (T[number] extends "paypal-payments"
        ? PayPalPaymentsInstance
        : Record<string, never>) &
    (T[number] extends "venmo-payments"
        ? VenmoPaymentsInstance
        : Record<string, never>) &
    (T[number] extends "paypal-legacy-billing-agreements"
        ? PayPalLegacyBillingInstance
        : Record<string, never>);

export interface BaseInstance {
    findEligibleMethods: (
        findEligibleMethodsOptions: FindEligibleMethodsOptions,
    ) => Promise<EligiblePaymentMethodsOutput>;
    updateLocale: (locale: string) => void;
}

export interface PayPalPaymentsInstance {
    createPayPalOneTimePaymentSession: (
        paymentSessionOptions: PayPalOneTimePaymentSessionOptions,
    ) => OneTimePaymentSession;
    createPayPalSavePaymentSession: (
        paymentSessionOptions: SavePaymentSessionOptions,
    ) => SavePaymentSession;
    createPayLaterOneTimePaymentSession: (
        paymentSessionOptions: PayLaterOneTimePaymentSessionOptions,
    ) => OneTimePaymentSession;
    createPayPalCreditOneTimePaymentSession: (
        paymentSessionOptions: PayPalCreditOneTimePaymentSessionOptions,
    ) => OneTimePaymentSession;
}

export interface VenmoPaymentsInstance {
    createVenmoOneTimePaymentSession: (
        paymentSessionOptions: VenmoPaymentSessionOptions,
    ) => OneTimePaymentSession;
}

export interface PayPalLegacyBillingInstance {
    /**
     * @deprecated This method is legacy and should not be used for new implementations.
     */
    createPayPalBillingAgreementWithoutPurchase: (
        paymentSessionOptions: BillingSessionOptions,
    ) => BillingAgreementPaymentSession;
}

export type OneTimePaymentSession = {
    start: (
        options: SessionStartOptions,
        orderIdPromise: Promise<{ orderId: string }>,
    ) => Promise<void>;
    destroy: () => void;
    cancel: () => void;
};

export type SavePaymentSession = {
    start: (
        options: SessionStartOptions,
        vaultSetupTokenPromise: Promise<{ vaultSetupToken: string }>,
    ) => Promise<void>;
    destroy: () => void;
    cancel: () => void;
};

export type BillingAgreementPaymentSession = {
    start: (
        options: SessionStartOptions,
        billingTokenPromise: Promise<{ billingToken: string }>,
    ) => Promise<void>;
    destroy: () => void;
    cancel: () => void;
};

export type PayPalPresentationModes =
    | "auto"
    | "direct-app-switch"
    | "modal"
    | "payment-handler"
    | "popup"
    | "redirect";

export type VenmoPresentationModes = "auto" | "modal" | "popup";

export type SessionStartOptions = {
    presentationMode?: PayPalPresentationModes | VenmoPresentationModes;
    targetElement?: string | HTMLElement;
    fullPageOverlay?: {
        enabled?: boolean;
    };
    autoRedirect?: {
        enabled?: boolean;
    };
    loadingScreen?: {
        label?: string; // does this need to be more specific
    };
};

export type VenmoEligibility = {
    eligibility: boolean | null;
    ineligibilityReason: string | null;
};

export type VenmoSessionStartOptions = SessionStartOptions & {
    eligibilityResponse?: VenmoEligibility | null;
    buttonSessionID?: string;
};

export function loadCustomScript(options: {
    url: string;
    attributes?: Record<string, string>;
}): Promise<void>;

// Components
export * from "./components/paypal-payments";
export * from "./components/paypal-legacy-billing-agreements";
export * from "./components/venmo-payments";
export * from "./components/find-eligible-methods";
