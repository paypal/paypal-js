import {
    PayPalOneTimePaymentPaymentSessionInputs,
    SavePaymentSessionInputs,
} from "./components/paypal-payments";
import { BillingSessionInputs } from "./components/paypal-legacy-billing-agreemens";
import { VenmoPaymentSessionInputs } from "./components/venmo-payments";

export interface PayPalV6Namespace {
    createInstance: (
        createInstanceOptions: CreateInstanceInputs,
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

export type CreateInstanceInputs = {
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
        paymentSessionOptions: BillingSessionInputs,
    ) => SessionOutput;
    // "paypal-payments" component
    createPayPalOneTimePaymentSession?: (
        paymentSessionOptions: PayPalOneTimePaymentPaymentSessionInputs,
    ) => SessionOutput;
    createPayPalSavePaymentSession?: (
        paymentSessionOptions: SavePaymentSessionInputs,
    ) => SessionOutput;
    // "venmo-payments" component
    createVenmoOneTimePaymentSession?: (
        paymentSessionOptions: VenmoPaymentSessionInputs,
    ) => SessionOutput;
    findEligibleMethods: (
        findEligibleMethodsOptions: FindEligibleMethodsInputs,
    ) => Promise<EligiblePaymentMethodsOutput>;
};

export type FindEligibleMethodsInputs = {
    currencyCode?: string;
};

export type SessionOutput = {
    start: (
        options: StartSessionInput,
        orderIdPromise: Promise<{ orderId: string }>,
    ) => Promise<void>;
    destroy: () => void;
    cancel: () => void;
};

export type BillingSessionOutput = {
    start: (
        options: StartSessionInput,
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

export type StartSessionInput = {
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

export type VenmoStartSessionInput = StartSessionInput & {
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
