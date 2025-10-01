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
 * use Omit<BasePaymentSessionOptions, "onApprove"> to change the arguments for onApprove()
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
};

export type PresentationModeOptionsForModal = {
    presentationMode: "modal";
};

export type PresentationModeOptionsForRedirect = {
    presentationMode: "redirect";
    autoRedirect?: { enabled: boolean };
};

export type PresentationModeOptionsForPaymentHandler = {
    presentationMode: "payment-handler";
};

export type PresentationModeOptionsForAuto = {
    presentationMode: "auto";
    fullPageOverlay?: { enabled: boolean };
};

export type BasePaymentSessionPromise = Promise<{ orderId: string }>;

/**
 * use Omit<BasePaymentSession, "start"> to change the arguments for start()
 */
export type BasePaymentSession = {
    start: (
        options: PresentationModeOptionsForAuto,
        PaymentSessionPromise?: BasePaymentSessionPromise,
    ) => Promise<void>;
    destroy: () => void;
    cancel: () => void;
};
