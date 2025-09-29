export type OnCompleteData = {
    paymentSessionState: "approved" | "cancelled" | "error";
};

export type OnErrorData = Error;

export type BasePaymentSessionOptions = {
    // this onApproveData will be overwritten
    onApprove: (data: Record<string, unknown>) => Promise<void>;
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

export type BasePaymentSessionPromise = Promise<Record<string, unknown>>;

export type BasePaymentSession = {
    start: (
        options: PresentationModeOptionsForAuto,
        // this PaymentSessionPromise will be overwritten
        PaymentSessionPromise?: BasePaymentSessionPromise,
    ) => Promise<void>;
    destroy: () => void;
    cancel: () => void;
};
