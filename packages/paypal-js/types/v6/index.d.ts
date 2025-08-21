import {
    PayPalOneTimePaymentPaymentSessionOptions,
    SavePaymentSessionOptions,
} from "./components/paypal-payments";
import { BillingSessionOptions } from "./components/paypal-legacy-billing-agreemens";
import { VenmoPaymentSessionOptions } from "./components/venmo-payments";

export interface PayPalV6Namespace {
    createInstance: (
        createInstanceOptions: CreateInstanceOptions,
    ) => Promise<SdkInstance>;
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

export type CreateInstanceOptions = {
    clientMetadataId?: string;
    clientToken: string;
    components?: Components[];
    locale?: string;
    pageType?: PageTypes;
    partnerAttributionId?: string;
    shopperSessionId?: string;
    testBuyerCountry?: string;
};

export type EligiblePaymentMethods =
    | "paypal_pay_later"
    | "paypal_credit"
    | "paypal"
    | "venmo";

export interface EligiblePaymentMethodsOutput {
    isEligible: (paymentMethod: EligiblePaymentMethods) => boolean;
}

export type SdkInstance = {
    // "paypal-legacy-billing-agreements" component

    /**
     * @deprecated This method is legacy and should not be used for new implementations.
     */
    createPayPalBillingAgreementWithoutPurchase?: (
        paymentSessionOptions: BillingSessionOptions,
    ) => SessionOutput;
    // "paypal-payments" component
    createPayPalOneTimePaymentSession?: (
        paymentSessionOptions: PayPalOneTimePaymentPaymentSessionOptions,
    ) => SessionOutput;
    createPayPalSavePaymentSession?: (
        paymentSessionOptions: SavePaymentSessionOptions,
    ) => SessionOutput;
    // "venmo-payments" component
    createVenmoOneTimePaymentSession?: (
        paymentSessionOptions: VenmoPaymentSessionOptions,
    ) => SessionOutput;
    findEligibleMethods: (
        findEligibleMethodsOptions: FindEligibleMethodsOptions,
    ) => Promise<EligiblePaymentMethodsOutput>;
};

export type FindEligibleMethodsOptions = {
    currencyCode?: string;
};

export type SessionOutput = {
    start: (
        options: SessionStartOptions,
        orderIdPromise: Promise<{ orderId: string }>,
    ) => Promise<void>;
    destroy: () => void;
    cancel: () => void;
};

export type BillingSessionOutput = {
    start: (
        options: SessionStartOptions,
        billingSessionOptionsPromise: Promise<{ billingToken: string }>,
    ) => Promise<void>;
    destroy: () => void;
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
    targetElement?: string | EventTarget;
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
    PromisePonyfill?: PromiseConstructor;
}): Promise<void>;

// Components
export * from "./components/paypal-payments";
export * from "./components/paypal-legacy-billing-agreemens";
export * from "./components/venmo-payments";
