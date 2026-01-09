import {
    OnShippingAddressChangeData,
    OnShippingOptionsChangeData,
} from "./paypal-payments";
import {
    PresentationModeOptionsForAuto,
    PresentationModeOptionsForModal,
    PresentationModeOptionsForPopup,
    PresentationModeOptionsForPaymentHandler,
    BasePaymentSessionOptions,
    OnApproveDataOneTimePayments,
    BasePaymentSession,
} from "./base-component";

export type PayPalSubscriptionSessionOptions = BasePaymentSessionOptions & {
    onApprove?: (data: OnApproveDataOneTimePayments) => Promise<void>;
    onShippingAddressChange?: (
        data: OnShippingAddressChangeData,
    ) => Promise<void>;
    onShippingOptionsChange?: (
        data: OnShippingOptionsChangeData,
    ) => Promise<void>;
};

export type PayPalSubscriptionPaymentSession = BasePaymentSession & {
    start: (
        presentationModeOptions: PayPalSubscriptionPresentationModeOptions,
        subscriptionsOptionsPromise?: Promise<{ subscriptionId: string }>,
    ) => Promise<void | { redirectURL?: string }>;
    hasReturned?: () => boolean;
    resume?: () => Promise<void>;
};

export interface PayPalSubscriptionsInstance {
    createPayPalSubscriptionPaymentSession: (
        subscriptionSessionOptions: PayPalSubscriptionSessionOptions,
    ) => PayPalSubscriptionPaymentSession;
}

export type PayPalSubscriptionPresentationModeOptions =
    | PresentationModeOptionsForAuto
    | PresentationModeOptionsForPopup
    | PresentationModeOptionsForModal
    | PresentationModeOptionsForPaymentHandler;
