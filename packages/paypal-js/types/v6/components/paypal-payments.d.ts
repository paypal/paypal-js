import {
    BasePaymentSessionOptions,
    BasePaymentSession,
    OnApproveDataOneTimePayments,
    PresentationModeOptionsForPopup,
    PresentationModeOptionsForModal,
    PresentationModeOptionsForAuto,
    PresentationModeOptionsForPaymentHandler,
    PresentationModeOptionsForRedirect,
} from "./base-component";

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

export type OnApproveDataSavePayments = {
    vaultSetupToken: string;
    payerId?: string;
};

export type PayPalOneTimePaymentSessionOptions = BasePaymentSessionOptions & {
    orderId?: string;
    onApprove?: (data: OnApproveDataOneTimePayments) => Promise<void>;
    onShippingAddressChange?: (
        data: OnShippingAddressChangeData,
    ) => Promise<void>;
    onShippingOptionsChange?: (
        data: OnShippingOptionsChangeData,
    ) => Promise<void>;
};

export type SavePaymentSessionOptions = Omit<
    BasePaymentSessionOptions,
    "onApprove"
> & {
    clientMetadataId?: string;
    orderId?: never;
    vaultSetupToken?: string;
    onApprove?: (data?: OnApproveDataSavePayments) => void;
};

export type PayPalPresentationModeOptions =
    | PresentationModeOptionsForAuto
    | PresentationModeOptionsForPopup
    | PresentationModeOptionsForModal
    | PresentationModeOptionsForPaymentHandler
    | PresentationModeOptionsForRedirect;

export type OneTimePaymentSession = BasePaymentSession & {
    start: (
        presentationModeOptions: PayPalPresentationModeOptions,
        paymentSessionPromise?: Promise<{ orderId: string }>,
    ) => Promise<void>;
};

export type SavePaymentSession = Omit<BasePaymentSession, "start"> & {
    start: (
        presentationModeOptions: PayPalPresentationModeOptions,
        paymentSessionPromise?: Promise<{ vaultSetupToken: string }>,
    ) => Promise<void>;
};

export type PayLaterOneTimePaymentSessionOptions =
    PayPalOneTimePaymentSessionOptions;

export type PayPalCreditOneTimePaymentSessionOptions =
    PayPalOneTimePaymentSessionOptions;

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
