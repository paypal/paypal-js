export * from "./PayPalProviderEnums";

export type * from "@paypal/paypal-js/sdk-v6";
export type * from "./sdkButtons";

export interface BasePaymentSessionReturn {
    error: Error | null;
    handleClick: () => Promise<{ redirectURL?: string } | void>;
    handleCancel: () => void;
    handleDestroy: () => void;
}

export const BUTTON_TYPES = {
    BUYNOW: "buynow",
    CHECKOUT: "checkout",
    DONATE: "donate",
    PAY: "pay",
    SUBSCRIBE: "subscribe",
} as const;

export type ButtonTypes = (typeof BUTTON_TYPES)[keyof typeof BUTTON_TYPES];
