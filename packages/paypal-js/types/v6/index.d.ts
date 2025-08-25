import {
    PayLaterCountryCodes,
    PayLaterProductCodes,
    PayPalCreditCountryCodes,
    PayPalOneTimePaymentSessionOptions,
    SavePaymentSessionOptions,
} from "./components/paypal-payments";
import { BillingSessionOptions } from "./components/paypal-legacy-billing-agreements";
import { VenmoPaymentSessionOptions } from "./components/venmo-payments";
import type { CamelizeObjectKeys } from "./utils";

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

export type FindEligibleMethodsOptions = {
    currencyCode?: string;
};

export type FundingSource =
    | "ach"
    | "advanced_cards"
    | "applepay"
    | "bancontact"
    | "blik"
    | "boletobancario"
    | "card"
    | "credit"
    | "eps"
    | "giropay"
    | "googlepay"
    | "ideal"
    | "itau"
    | "maxima"
    | "mercadopago"
    | "multibanco"
    | "mybank"
    | "oxxo"
    | "p24"
    | "paidy"
    | "paylater"
    | "paypal"
    | "payu"
    | "satispay"
    | "sepa"
    | "sofort"
    | "trustly"
    | "venmo"
    | "verkkopankki"
    | "wechatpay"
    | "zimpler";

type EligiblePaymentMethodDetails = {
    can_be_vaulted?: boolean;
    eligible_in_paypal_network?: boolean;
    recommended?: boolean;
    recommended_priority?: number;
    country_code?: PayLaterCountryCodes | PayPalCreditCountryCodes;
    product_code?: PayLaterProductCodes;
};

type FindEligibleMethodsGetDetailsReturnType =
    CamelizeObjectKeys<EligiblePaymentMethodDetails>;

export interface EligiblePaymentMethodsOutput {
    isEligible: (paymentMethod: FundingSource) => boolean;
    getDetails: (
        fundingSource: FundingSource,
    ) => FindEligibleMethodsGetDetailsReturnType;
}

export type SdkInstance = {
    // "paypal-legacy-billing-agreements" component

    /**
     * @deprecated This method is legacy and should not be used for new implementations.
     */
    createPayPalBillingAgreementWithoutPurchase?: (
        paymentSessionOptions: BillingSessionOptions,
    ) => BillingAgreementPaymentSession;
    // "paypal-payments" component
    createPayPalOneTimePaymentSession?: (
        paymentSessionOptions: PayPalOneTimePaymentSessionOptions,
    ) => OneTimePaymentSession;
    createPayPalSavePaymentSession?: (
        paymentSessionOptions: SavePaymentSessionOptions,
    ) => SavePaymentSession;
    // "venmo-payments" component
    createVenmoOneTimePaymentSession?: (
        paymentSessionOptions: VenmoPaymentSessionOptions,
    ) => OneTimePaymentSession;
    findEligibleMethods: (
        findEligibleMethodsOptions: FindEligibleMethodsOptions,
    ) => Promise<EligiblePaymentMethodsOutput>;
};

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
