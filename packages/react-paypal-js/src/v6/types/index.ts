export * from "./PayPalProviderEnums";

export type * from "@paypal/paypal-js/sdk-v6";
export type * from "./sdkWebComponents";

export interface BasePaymentSessionReturn {
    error: Error | null;
    handleClick: () => Promise<{ redirectURL?: string } | void>;
    handleCancel: () => void;
    handleDestroy: () => void;
}
