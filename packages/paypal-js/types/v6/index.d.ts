export interface PayPalV6Namespace {
    createInstance: (
        createInstanceOptions: CreateInstanceOptions,
    ) => Promise<SdkInstance>;
}

export type Components = "paypal-payments" | "venmo-payments";

export type PageTypes =
    | "cart"
    | "checkout"
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
};

export type EligiblePaymentMethods =
    | "paypal_pay_later"
    | "paypal_credit"
    | "paypal"
    | "venmo";

export interface EligiblePaymentMethodsOutput {
    isEligible: (paymentMethod: EligiblePaymentMethods) => boolean;
}

export type OnShippingAddressChangeData = {
    orderId: string;
    shippingAddress: {
        city: string;
        countryCode: string;
        postalCode: string;
        state: string;
    };
};

export type OnShippingOptionsChangeData = {
    orderId: string;
    selectedShippingOption: {
        amount: {
            currencyCode: string;
            value: string;
        };
        id: string;
        label: string;
        selected: boolean;
        type: string;
    };
};

// TODO separate types for PayPal and Venmo?
export type PaymentSessionInputs = {
    onApprove?: (data: OnApproveData) => Promise<void>;
    onCancel?: (data?: { orderId: string }) => void;
    onComplete?: (data?: OnCompleteData) => void;
    onError?: (data: Error) => void;
    onShippingAddressChange?: (
        data: OnShippingAddressChangeData,
    ) => Promise<void>;
    onShippingOptionsChange?: (
        data: OnShippingOptionsChangeData,
    ) => Promise<void>;
    savePayment?: boolean;
};

export type VenmoPaymentSessionInputs = Omit<
    PaymentSessionInputs,
    "onShippingAddressChange" | "onShippingOptionsChange"
>;

export type OnApproveData = {
    orderId: string;
    payerId?: string;
    billingToken?: string;
};

export type OnCompleteData = {
    paymentSessionState?: string;
};

export type SdkInstance = {
    // "paypal-payments" component
    createPayPalOneTimePaymentSession: (
        paymentSessionOptions: PaymentSessionInputs,
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
