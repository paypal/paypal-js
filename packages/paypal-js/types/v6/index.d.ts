import {
    PaymentSessionInputs,
    SavePaymentSessionInputs,
    VenmoPaymentSessionInputs,
} from "./components/payments";
import { BillingSessionInputs } from "./components/billing";

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
    createPayPalBillingAgreementWithoutPurchase: (
        paymentSessionOptions: BillingSessionInputs,
    ) => SessionOutput;
    // "paypal-payments" component
    createPayPalOneTimePaymentSession: (
        paymentSessionOptions: PaymentSessionInputs,
    ) => SessionOutput;
    createPayPalSavePaymentSession: (
        paymentSessionOptions: SavePaymentSessionInputs,
    ) => SessionOutput;
    // "venmo-payments" component
    createVenmoOneTimePaymentSession: (
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
export * from "./components/payments";
export * from "./components/billing";
