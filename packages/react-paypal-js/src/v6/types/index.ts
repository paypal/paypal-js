export * from "./PayPalProviderEnums";

export type * from "@paypal/paypal-js/sdk-v6";

export interface BasePaymentSessionReturn {
    buttonRef?: { current: HTMLElement | null };
    error: Error | null;
    handleClick: () => Promise<{ redirectURL?: string } | void>;
    handleCancel: () => void;
    handleDestroy: () => void;
    isProcessing?: boolean;
}
