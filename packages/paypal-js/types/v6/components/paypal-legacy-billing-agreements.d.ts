import {
    BasePaymentSessionOptions,
    BasePaymentSession,
    PresentationModeOptionsForPopup,
    PresentationModeOptionsForModal,
    PresentationModeOptionsForAuto,
    PresentationModeOptionsForPaymentHandler,
} from "./base-component";

export type OnApproveDataBillingAgreements = {
    billingToken: string;
    payerId?: string;
};

export type PayPalLegacyBillingAgreementsSessionOptions = Omit<
    BasePaymentSessionOptions,
    "onApprove"
> & {
    billingToken?: string;
    onApprove: (data: OnApproveDataBillingAgreements) => Promise<void>;
};

export type PayPalLegacyBillingPresentationModeOptions =
    | PresentationModeOptionsForAuto
    | PresentationModeOptionsForPopup
    | PresentationModeOptionsForModal
    | PresentationModeOptionsForPaymentHandler;

export type PayPalLegacyBillingAgreementsSessionPromise = Promise<{
    billingToken: string;
}>;

export type PayPalLegacyBillingAgreementsSession = Omit<
    BasePaymentSession,
    "start"
> & {
    start: (
        presentationModeOptions: PayPalLegacyBillingPresentationModeOptions,
        paymentSessionPromise?: PayPalLegacyBillingAgreementsSessionPromise,
    ) => Promise<void>;
};

export interface PayPalLegacyBillingInstance {
    /**
     * Creates a PayPal billing agreement session without requiring an immediate purchase.
     * This legacy method allows merchants to set up recurring payment agreements with customers
     * that can be used for future transactions.
     *
     * @deprecated This method is legacy and should not be used for new implementations.
     * Use the newer vault setup token approach with createPayPalSavePaymentSession instead.
     *
     * @param paymentSessionOptions - Configuration options for the billing agreement session
     * @returns A PayPalLegacyBillingAgreementsSession object that can be used to start the billing agreement flow
     *
     * @example
     * ```typescript
     * const billingSession = sdkInstance.createPayPalBillingAgreementWithoutPurchase({
     *   billingToken: 'your-billing-token',
     *   onApprove: (data) => {
     *     console.log('Billing agreement approved:', data);
     *   },
     *   onCancel: () => {
     *     console.log('Billing agreement canceled');
     *   },
     *   onError: (data) => {
     *     console.error('Billing agreement error:', data);
     *   }
     * });
     * ```
     */
    createPayPalBillingAgreementWithoutPurchase: (
        paymentSessionOptions: PayPalLegacyBillingAgreementsSessionOptions,
    ) => PayPalLegacyBillingAgreementsSession;
}
