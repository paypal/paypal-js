import type {
    IntrinsicButtonProps,
    IntrinsicPayLaterButtonProps,
} from "./types/sdkWebComponents";

export * from "./types";
export type { ButtonProps } from "./types/sdkWebComponents";
export {
    PayPalCardFieldsProvider,
    type CardFieldsSessionType,
} from "./components/PayPalCardFieldsProvider";
export { PayLaterOneTimePaymentButton } from "./components/PayLaterOneTimePaymentButton";
export { PayPalOneTimePaymentButton } from "./components/PayPalOneTimePaymentButton";
export { VenmoOneTimePaymentButton } from "./components/VenmoOneTimePaymentButton";
export { PayPalProvider } from "./components/PayPalProvider";
export { usePayPalCardFields } from "./hooks/usePayPalCardFields";
export {
    usePayPalCardFieldsOneTimePaymentSession,
    type usePayPalCardFieldsOneTimePaymentSessionResult,
} from "./hooks/usePayPalCardFieldsOneTimePaymentSession";
export {
    usePayPalCardFieldsSavePaymentSession,
    type usePayPalCardFieldsSavePaymentSessionResult,
} from "./hooks/usePayPalCardFieldsSavePaymentSession";
export { usePayPal } from "./hooks/usePayPal";
export { usePayLaterOneTimePaymentSession } from "./hooks/usePayLaterOneTimePaymentSession";
export { usePayPalOneTimePaymentSession } from "./hooks/usePayPalOneTimePaymentSession";
export { usePayPalSavePaymentSession } from "./hooks/usePayPalSavePaymentSession";
export { useVenmoOneTimePaymentSession } from "./hooks/useVenmoOneTimePaymentSession";
export { usePayPalGuestPaymentSession } from "./hooks/usePayPalGuestPaymentSession";
export * from "./hooks/useEligibleMethods";
export { usePayPalMessages } from "./hooks/usePayPalMessages";

// React 19+ JSX types augmentation
declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace JSX {
        interface IntrinsicElements {
            "paypal-button": IntrinsicButtonProps;
            "venmo-button": IntrinsicButtonProps;
            "paypal-pay-later-button": IntrinsicPayLaterButtonProps;
        }
    }
}

// React 17/18 JSX types augmentation (for backwards compatibility)
declare module "react" {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace JSX {
        interface IntrinsicElements {
            "paypal-button": IntrinsicButtonProps;
            "venmo-button": IntrinsicButtonProps;
            "paypal-pay-later-button": IntrinsicPayLaterButtonProps;
        }
    }
}
