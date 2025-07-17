export interface PayPalV6Namespace {
    createInstance: (
        createInstanceOptions: CreateInstanceOptions,
    ) => Promise<SdkInstance>;
}

export enum COMPONENTS {
    PAYPAL_PAYMENTS = "paypal-payments",
    VENMO_PAYMENTS = "venmo-payments",
}
export type Components = `${COMPONENTS}`;

export enum PAGE_TYPES {
    CART = "cart",
    CHECKOUT = "checkout",
    MINI_CART = "mini-cart",
    PRODUCT_DETAILS = "product-details",
    PRODUCT_LISTING = "product-listing",
    SEARCH_RESULTS = "search-results",
}
export type PageTypes = `${PAGE_TYPES}`;

type CreateInstanceOptions = {
    clientMetadataId?: string;
    clientToken: string;
    components?: Components[];
    locale?: string;
    pageType?: PageTypes;
    partnerAttributionId?: string;
};

export interface EligiblePaymentMethods {
    isEligible: (paymentMethod: string) => boolean;
}

// TODO separate types for PayPal and Venmo?
export type PaymentSessionOptions = {
    onApprove?: (data: OnApproveData) => Promise<void>;
    onCancel?: (data?: { orderId: string }) => void;
    onComplete?: (data?: OnCompleteData) => void;
    onError?: (data: Error) => void;
};

type OnApproveData = {
    orderId?: string;
    payerId?: string;
    billingToken?: string;
};

type OnCompleteData = {
    paymentSessionState?: string;
};

export type SdkInstance = {
    // "paypal-payments" component
    createPayPalOneTimePaymentSession: (
        paymentSessionOptions: PaymentSessionOptions,
    ) => SessionOutput;
    // "venmo-payments" component
    createVenmoOneTimePaymentSession: (
        paymentSessionOptions: PaymentSessionOptions,
    ) => SessionOutput;
    findEligibleMethods: (
        findEligibleMethodsOptions: FindEligibleMethodsOptions,
    ) => Promise<EligiblePaymentMethods>;
};

type FindEligibleMethodsOptions = {
    currencyCode?: string;
};

type SessionOutput = {
    start: (
        options: StartSessionInput,
        orderIdPromise: Promise<{ orderId: string }>,
    ) => Promise<void>;
    destroy: () => void;
    cancel: () => void;
};

declare enum PAYPAL_PRESENTATION_MODES {
    AUTO = "auto",
    MODAL = "modal",
    PAYMENT_HANDLER = "payment-handler",
    POPUP = "popup",
    REDIRECT = "redirect",
}

export type PayPalPresentationModes = `${PAYPAL_PRESENTATION_MODES}`;

declare enum VENMO_PRESENTATION_MODES {
    AUTO = "auto",
    MODAL = "modal",
    POPUP = "popup",
}

export type VenmoPresentationModes = `${VENMO_PRESENTATION_MODES}`;

type StartSessionInput = {
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
