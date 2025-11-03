export * from "./PayPalProviderEnums";

export type * from "@paypal/paypal-js/sdk-v6";

export interface BasePaymentSessionReturn {
    handleClick: () => Promise<void>;
    handleCancel: () => void;
    handleDestroy: () => void;
}
