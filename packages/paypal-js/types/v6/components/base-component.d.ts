/* eslint-disable tsdoc/syntax */
/**
 * @module
 * @internal
 */
/* eslint-enable tsdoc/syntax */

export type OnApproveDataOneTimePayments = {
    orderId: string;
    payerId?: string;
    billingToken?: string;
};

export type OnCompleteData = {
    paymentSessionState: "approved" | "canceled" | "error";
};

export type OnErrorData = Error;

/**
 * use Omit\<BasePaymentSessionOptions, "onApprove"\> to change the arguments for onApprove()
 */
export type BasePaymentSessionOptions = {
    onApprove: (data: OnApproveDataOneTimePayments) => Promise<void>;
    onCancel?: () => void;
    onComplete?: (data: OnCompleteData) => void;
    onError?: (data: OnErrorData) => void;
    testBuyerCountry?: string;
};

export type PresentationModeOptionsForPopup = {
    presentationMode: "popup";
    fullPageOverlay?: { enabled: boolean };
    autoRedirect?: never;
};

export type PresentationModeOptionsForModal = {
    presentationMode: "modal";
    fullPageOverlay?: never;
    autoRedirect?: never;
};

export type PresentationModeOptionsForRedirect = {
    presentationMode: "redirect";
    fullPageOverlay?: never;
    autoRedirect?: { enabled: boolean };
};

export type PresentationModeOptionsForPaymentHandler = {
    presentationMode: "payment-handler";
    fullPageOverlay?: never;
    autoRedirect?: never;
};

export type PresentationModeOptionsForAuto = {
    presentationMode: "auto";
    fullPageOverlay?: { enabled: boolean };
    autoRedirect?: never;
};

export type CreateOrderPromise = Promise<{ orderId: string }>;

export type CreateOrderCallback = () => CreateOrderPromise;

/**
 * use Omit\<BasePaymentSession, "start"\> to change the arguments for start()
 */
export type BasePaymentSession = {
    start: (
        options: PresentationModeOptionsForAuto,
        PaymentSessionPromise?: CreateOrderPromise,
    ) => Promise<void>;
    destroy: () => void;
    cancel: () => void;
};
