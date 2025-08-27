export type PayLaterCountryCodes =
    | "AU"
    | "DE"
    | "ES"
    | "FR"
    | "GB"
    | "IT"
    | "US";

export type PayLaterProductCodes = "PAYLATER" | "PAY_LATER_SHORT_TERM";

export type PayPalCreditCountryCodes = "US" | "GB";

export type ShippingAddressErrorType =
    | "ADDRESS_ERROR"
    | "COUNTRY_ERROR"
    | "STATE_ERROR"
    | "ZIP_ERROR";

export type ShippingAddressErrorMessages = Record<
    ShippingAddressErrorType,
    string
>;

export type ShippingOptionsErrorType =
    | "METHOD_UNAVAILABLE"
    | "STORE_UNAVAILABLE";

export type ShippingOptionsErrorMessages = Record<
    ShippingOptionsErrorType,
    string
>;

export type OnShippingAddressChangeData = {
    errors: ShippingAddressErrorMessages;
    orderId: string;
    shippingAddress: {
        city?: string;
        countryCode: string;
        postalCode?: string;
        state?: string;
    };
};

export type OnShippingOptionsChangeData = {
    errors: ShippingOptionsErrorMessages;
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

export type OnApproveDataOneTimePayments = {
    orderId: string;
    payerId?: string;
    billingToken?: string;
};

export type OnApproveDataSavePayments = {
    vaultSetupToken: string;
    payerId?: string;
};

export type OnCompleteData = {
    paymentSessionState?: string;
};

export type OnCancelData = {
    orderId: string;
};

export type OnErrorData = Error;

export type BaseSessionOptions = {
    onCancel?: (data?: OnCancelData) => void;
    onComplete?: (data?: OnCompleteData) => void;
    onError?: (data: OnErrorData) => void;
    testBuyerCountry?: string;
};

export type PayPalOneTimePaymentSessionOptions = BaseSessionOptions & {
    onApprove?: (data: OnApproveDataOneTimePayments) => Promise<void>;
    onShippingAddressChange?: (
        data: OnShippingAddressChangeData,
    ) => Promise<void>;
    onShippingOptionsChange?: (
        data: OnShippingOptionsChangeData,
    ) => Promise<void>;
    savePayment?: boolean;
};

export type SavePaymentSessionOptions = BaseSessionOptions & {
    clientMetadataId?: string;
    orderId?: never;
    vaultSetupToken?: string;
    onApprove?: (data?: OnApproveDataSavePayments) => void;
};

export type PayLaterOneTimePaymentSessionOptions =
    PayPalOneTimePaymentSessionOptions;

export type PayPalCreditOneTimePaymentSessionOptions =
    PayPalOneTimePaymentSessionOptions;
