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

export type OnApproveData =
    | OnApproveDataOneTimePayments
    | OnApproveDataSavePayments;

export type OnCompleteData = {
    paymentSessionState?: string;
};

export type OnCancelData = {
    orderId: string;
};

export type OnErrorData = Error;

export type PayPalOneTimePaymentPaymentSessionInputs = {
    onApprove?: (data: OnApproveDataOneTimePayments) => Promise<void>;
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
    testBuyerCountry?: string;
};

export type SavePaymentSessionInputs = {
    testBuyerCountry?: string;
    clientMetadataId?: string;
    onError?: (data: OnErrorData) => void;
    onCancel?: (data?: OnCancelData) => void;
    onComplete?: (data?: OnCompleteData) => void;
    orderId?: never;
    setupToken?: string;
    onApprove?: (data?: OnApproveDataSavePayments) => void;
};

export type VenmoPaymentSessionInputs = Omit<
    PaymentSessionInputs,
    "onShippingAddressChange" | "onShippingOptionsChange"
>;
