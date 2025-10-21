import {
    BasePaymentSessionOptions,
    BasePaymentSession,
    PresentationModeOptionsForPopup,
    PresentationModeOptionsForModal,
    PresentationModeOptionsForAuto,
} from "./base-component";

export type VenmoOneTimePaymentSessionOptions = BasePaymentSessionOptions & {
    orderId?: string;
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

/**
 * Interface for managing Venmo payment operations within the PayPal SDK.
 *
 * @remarks
 * This interface provides methods for creating and managing Venmo payment sessions,
 * allowing merchants to integrate Venmo as a payment method in their applications.
 *
 * The {@link VenmoPaymentsInstance} enables seamless integration with Venmo's payment flow,
 * providing a secure and user-friendly way to process payments through the Venmo platform.
 */
export interface VenmoPaymentsInstance {
    /**
     * Creates a Venmo one-time payment session for processing payments through Venmo.
     *
     * @remarks
     * This method allows you to configure callback functions to handle different stages
     * of the Venmo checkout process, including payment approval, cancelation, and errors.
     *
     * @param paymentSessionOptions - Configuration options for the Venmo payment session
     * @returns A session object that can be used to start the payment flow
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
