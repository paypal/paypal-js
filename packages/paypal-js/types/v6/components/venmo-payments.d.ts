import {
    BasePaymentSessionOptions,
    BasePaymentSession,
    OnApproveDataOneTimePayments,
    PresentationModeOptionsForPopup,
    PresentationModeOptionsForModal,
    PresentationModeOptionsForAuto,
} from "./base-component";

export type VenmoOneTimePaymentSessionOptions = BasePaymentSessionOptions & {
    orderId?: string;
    onApprove: (data: OnApproveDataOneTimePayments) => Promise<void>;
};

export type VenmoPresentationModeOptions =
    | PresentationModeOptionsForAuto
    | PresentationModeOptionsForPopup
    | PresentationModeOptionsForModal;

export type VenmoOneTimePaymentSessionPromise = Promise<{ orderId: string }>;

export type VenmoOneTimePaymentSession = Omit<BasePaymentSession, "start"> & {
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
