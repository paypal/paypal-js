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
    /**
     * Creates a Venmo one-time payment session for processing payments through Venmo.
     * This method allows you to configure callback functions to handle different stages
     * of the Venmo checkout process, including payment approval, cancelation, and errors.
     *
     * @param paymentSessionOptions - Configuration options for the Venmo payment session
     * @returns A VenmoOneTimePaymentSession object that can be used to start the payment flow
     *
     * @example
     * ```typescript
     * const venmoSession = sdkInstance.createVenmoOneTimePaymentSession({
     *   onApprove: (data) => {
     *     console.log('Venmo payment approved:', data);
     *   },
     *   onCancel: () => {
     *     console.log('Venmo payment canceled');
     *   },
     *   onError: (data) => {
     *     console.error('Venmo payment error:', data);
     *   }
     * });
     * ```
     */
    createVenmoOneTimePaymentSession: (
        paymentSessionOptions: VenmoOneTimePaymentSessionOptions,
    ) => VenmoOneTimePaymentSession;
}
