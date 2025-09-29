import {
    BasePaymentSessionOptions,
    BasePaymentSession,
    PresentationModeOptionsForPopup,
    PresentationModeOptionsForModal,
    PresentationModeOptionsForAuto,
} from "./base-component";

export type OnApproveDataVenmoOneTimePayments = {
    orderId: string;
    payerId?: string;
    billingToken?: string;
};

export type VenmoOneTimePaymentSessionOptions = BasePaymentSessionOptions & {
    orderId?: string;
    onApprove: (data: OnApproveDataVenmoOneTimePayments) => Promise<void>;
};

export type VenmoPresentationModeOptions =
    | PresentationModeOptionsForAuto
    | PresentationModeOptionsForPopup
    | PresentationModeOptionsForModal;

export type VenmoOneTimePaymentSessionPromise = Promise<{ orderId: string }>;

export type VenmoOneTimePaymentSession = BasePaymentSession & {
    start: (
        presentationModeOptions: VenmoPresentationModeOptions,
        paymentSessionPromise?: VenmoOneTimePaymentSessionPromise,
    ) => Promise<void>;
};

export interface VenmoPaymentsInstance {
    createVenmoOneTimePaymentSession: (
        paymentSessionOptions: VenmoOneTimePaymentSessionOptions,
    ) => VenmoOneTimePaymentSession;
}
