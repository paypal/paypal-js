// ---- Shared types ----

export interface BraintreeLineItem {
    quantity: string;
    unitAmount: string;
    name: string;
    kind: "debit" | "credit";
    unitTaxAmount?: string;
    description?: string;
}

export interface BraintreeShippingOption {
    id: string;
    label: string;
    selected: boolean;
    type: "SHIPPING" | "PICKUP";
    amount: {
        currency: string;
        value: string;
    };
}

export interface BraintreeAmountBreakdown {
    itemTotal?: string;
    shipping?: string;
    handling?: string;
    taxTotal?: string;
    insurance?: string;
    shippingDiscount?: string;
    discount?: string;
}

export interface BraintreePricingScheme {
    pricingModel: "FIXED" | "VARIABLE" | "AUTO_RELOAD";
    price: string;
    reloadThresholdAmount?: string;
}

export interface BraintreeBillingCycle {
    billingFrequency: string | number;
    billingFrequencyUnit: "DAY" | "WEEK" | "MONTH" | "YEAR";
    numberOfExecutions: string | number;
    sequence: string | number;
    startDate: string;
    trial: boolean;
    pricingScheme: BraintreePricingScheme;
}

export interface BraintreePlanMetadata {
    billingCycles?: BraintreeBillingCycle[];
    currencyIsoCode: string;
    name: string;
    oneTimeFeeAmount?: string | number;
    productDescription?: string;
    productPrice?: string | number;
    productQuantity?: string | number;
    shippingAmount?: string | number;
    taxAmount?: string | number;
    totalAmount?: string;
}

// ---- Callback data types ----

export interface BraintreeApprovalData {
    payerId?: string;
    orderId?: string;
    billingToken?: string;
}

export interface BraintreeShippingAddress {
    city: string;
    countryCode: string;
    postalCode: string;
    state: string;
}

export interface BraintreeShippingAddressChangeData {
    errors?: Record<string, unknown>;
    orderId: string;
    shippingAddress: BraintreeShippingAddress;
}

export interface BraintreeShippingOptionsChangeData {
    errors?: Record<string, unknown>;
    orderId: string;
    selectedShippingOption: {
        id: string;
        label: string;
        amount: { value: string; currency: string };
        type: string;
        selected: boolean;
    };
}

// ---- Tokenize payload ----

export interface BraintreeTokenizePayload {
    nonce: string;
    type: string;
    details: {
        email: string;
        payerId: string;
        firstName: string;
        lastName: string;
        countryCode?: string;
        phone?: string;
        shippingAddress?: {
            recipientName: string;
            line1: string;
            line2: string;
            city: string;
            state: string;
            postalCode: string;
            countryCode: string;
        };
        billingAddress?: {
            line1: string;
            line2: string;
            city: string;
            state: string;
            postalCode: string;
            countryCode: string;
        };
        creditFinancingOffered?: {
            totalCost: { value: string; currency: string };
            term: { term: number };
            monthlyPayment: { value: string; currency: string };
            totalInterest: { value: string; currency: string };
            payerAcceptance: boolean;
            cartAmountImmutable: boolean;
        };
        shippingOptionId?: string;
        cobrandedCardLabel?: string;
    };
}

// ---- Eligibility result ----

export interface BraintreeEligibilityResult {
    paypal: boolean;
    paylater: boolean;
    credit: boolean;
    getDetails: (
        methodName: "paypal" | "paylater" | "credit",
    ) => Record<string, unknown> | null;
}

// ---- Method options ----

export type BraintreePresentationMode =
    | "auto"
    | "popup"
    | "modal"
    | "redirect"
    | "payment-handler"
    | "direct-app-switch";

export interface BraintreeOneTimePaymentSessionOptions {
    amount: string;
    currency: string;
    intent?: "authorize" | "capture" | "order";
    commit?: boolean;
    offerCredit?: boolean;
    onApprove: (data: BraintreeApprovalData) => Promise<void>;
    onCancel?: () => void;
    onError?: (err: Error) => void;
    onShippingAddressChange?: (
        data: BraintreeShippingAddressChangeData,
    ) => Promise<void>;
    onShippingOptionsChange?: (
        data: BraintreeShippingOptionsChangeData,
    ) => Promise<void>;
    lineItems?: BraintreeLineItem[];
    shippingOptions?: BraintreeShippingOption[];
    userAuthenticationEmail?: string;
    amountBreakdown?: BraintreeAmountBreakdown;
    returnUrl?: string;
    cancelUrl?: string;
    displayName?: string;
    presentationMode?: BraintreePresentationMode;
}

export interface BraintreeBillingAgreementSessionOptions {
    billingAgreementDescription?: string;
    planType?: "RECURRING" | "SUBSCRIPTION" | "UNSCHEDULED" | "INSTALLMENTS";
    planMetadata?: BraintreePlanMetadata;
    amount?: string;
    currency?: string;
    offerCredit?: boolean;
    shippingAddressOverride?: Record<string, unknown>;
    userAction?: "CONTINUE" | "COMMIT" | "SETUP_NOW";
    displayName?: string;
    returnUrl?: string;
    cancelUrl?: string;
    onApprove: (data: BraintreeApprovalData) => Promise<void>;
    onCancel?: () => void;
    onError?: (err: Error) => void;
    presentationMode?: BraintreePresentationMode;
}

export interface BraintreeCheckoutWithVaultSessionOptions {
    amount: string;
    currency: string;
    intent?: "authorize" | "capture" | "order";
    commit?: boolean;
    billingAgreementDetails?: {
        description?: string;
    };
    onApprove: (data: BraintreeApprovalData) => Promise<void>;
    onCancel?: () => void;
    onError?: (err: Error) => void;
    onShippingAddressChange?: (
        data: BraintreeShippingAddressChangeData,
    ) => Promise<void>;
    onShippingOptionsChange?: (
        data: BraintreeShippingOptionsChangeData,
    ) => Promise<void>;
    lineItems?: BraintreeLineItem[];
    shippingOptions?: BraintreeShippingOption[];
    userAuthenticationEmail?: string;
    amountBreakdown?: BraintreeAmountBreakdown;
    returnUrl?: string;
    cancelUrl?: string;
    displayName?: string;
    presentationMode?: BraintreePresentationMode;
}

export interface BraintreePayLaterSessionOptions {
    amount: string;
    currency: string;
    intent?: "authorize" | "capture" | "order";
    onApprove: (data: BraintreeApprovalData) => Promise<void>;
    onCancel?: () => void;
    onComplete?: () => void;
    onError?: (err: Error) => void;
    onShippingAddressChange?: (
        data: BraintreeShippingAddressChangeData,
    ) => Promise<void>;
    onShippingOptionsChange?: (
        data: BraintreeShippingOptionsChangeData,
    ) => Promise<void>;
    lineItems?: BraintreeLineItem[];
    shippingOptions?: BraintreeShippingOption[];
    userAuthenticationEmail?: string;
    amountBreakdown?: BraintreeAmountBreakdown;
    returnUrl?: string;
    cancelUrl?: string;
    displayName?: string;
    presentationMode?: BraintreePresentationMode;
}

export interface BraintreeCreatePaymentOptions {
    flow: "checkout" | "vault";
    amount?: string;
    currency?: string;
    intent?: string;
    offerCredit?: boolean;
    billingAgreementDescription?: string;
    planType?: "RECURRING" | "SUBSCRIPTION" | "UNSCHEDULED" | "INSTALLMENTS";
    planMetadata?: BraintreePlanMetadata;
    shippingAddressOverride?: Record<string, unknown>;
    userAction?: string;
    displayName?: string;
}

export interface BraintreeFindEligibleMethodsOptions {
    amount?: string;
    currency: string;
    countryCode?: string;
    paymentFlow?:
        | "ONE_TIME_PAYMENT"
        | "VAULT_WITH_PAYMENT"
        | "VAULT_WITHOUT_PAYMENT"
        | "RECURRING_PAYMENT";
}

export interface BraintreeTokenizePaymentOptions {
    payerID?: string;
    orderID?: string;
    billingToken?: string;
    vault?: boolean;
}

export interface BraintreeUpdatePaymentOptions {
    paymentId: string;
    amount: string;
    currency: string;
    lineItems?: BraintreeLineItem[];
    shippingOptions?: BraintreeShippingOption[];
    amountBreakdown?: BraintreeAmountBreakdown;
}

export interface BraintreeLoadPayPalSDKOptions {
    env?: string;
}

// ---- Session object ----

export interface BraintreePaymentSession {
    start: () => void;
}

// ---- Core types ----

export interface BraintreeClientInstance {
    [key: string]: unknown;
}

export interface BraintreePayPalCheckoutInstance {
    loadPayPalSDK: (
        options?: BraintreeLoadPayPalSDKOptions,
    ) => Promise<BraintreePayPalCheckoutInstance>;
    tokenizePayment: (
        options: BraintreeTokenizePaymentOptions,
    ) => Promise<BraintreeTokenizePayload>;
    createOneTimePaymentSession: (
        options: BraintreeOneTimePaymentSessionOptions,
    ) => BraintreePaymentSession;
    createBillingAgreementSession: (
        options: BraintreeBillingAgreementSessionOptions,
    ) => BraintreePaymentSession;
    createCheckoutWithVaultSession: (
        options: BraintreeCheckoutWithVaultSessionOptions,
    ) => BraintreePaymentSession;
    createPayLaterSession: (
        options: BraintreePayLaterSessionOptions,
    ) => BraintreePaymentSession;
    createPayment: (options: BraintreeCreatePaymentOptions) => Promise<string>;
    findEligibleMethods: (
        options: BraintreeFindEligibleMethodsOptions,
    ) => Promise<BraintreeEligibilityResult>;
    getClientId: () => Promise<string>;
    updatePayment: (
        options: BraintreeUpdatePaymentOptions,
        callback?: (error: Error | null, response: unknown) => void,
    ) => Promise<unknown> | undefined;
    teardown: () => Promise<void>;
    [key: string]: unknown;
}

export interface BraintreeV6Namespace {
    client: {
        create: (options: {
            authorization: string;
        }) => Promise<BraintreeClientInstance>;
    };
    paypalCheckoutV6: {
        create: (options: {
            client: BraintreeClientInstance;
        }) => Promise<BraintreePayPalCheckoutInstance>;
    };
    [key: string]: unknown;
}

export function validateBraintreeNamespace(
    namespace: unknown,
): namespace is BraintreeV6Namespace {
    const ns = namespace as BraintreeV6Namespace | null | undefined;

    return (
        typeof ns?.client?.create === "function" &&
        typeof ns?.paypalCheckoutV6?.create === "function"
    );
}
