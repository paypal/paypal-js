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

export type PayPalLegacyBillingAgreementsSessionOptions =
    BasePaymentSessionOptions & {
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

export type PayPalLegacyBillingAgreementsSession = BasePaymentSession & {
    start: (
        presentationModeOptions: PayPalLegacyBillingPresentationModeOptions,
        paymentSessionPromise?: PayPalLegacyBillingAgreementsSessionPromise,
    ) => Promise<void>;
};

export interface PayPalLegacyBillingInstance {
    /**
     * @deprecated This method is legacy and should not be used for new implementations.
     */
    createPayPalBillingAgreementWithoutPurchase: (
        paymentSessionOptions: PayPalLegacyBillingAgreementsSessionOptions,
    ) => PayPalLegacyBillingAgreementsSession;
}
