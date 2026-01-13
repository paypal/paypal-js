import type { SDKWebComponents } from "./types/sdkWebComponents";

export * from "./types";
export type {
    ButtonProps,
    InternalButtonProps,
    PayLaterButtonProps,
    PayPalBasicCardButtonProps,
    PayPalCreditButtonProps,
    PayPalMessagesElement,
} from "./types/sdkWebComponents";
export {
    PayPalCardFieldsProvider,
    type CardFieldsSessionType,
} from "./components/PayPalCardFieldsProvider";
export { PayLaterOneTimePaymentButton } from "./components/PayLaterOneTimePaymentButton";
export { PayPalOneTimePaymentButton } from "./components/PayPalOneTimePaymentButton";
export { PayPalSavePaymentButton } from "./components/PayPalSavePaymentButton";
export { VenmoOneTimePaymentButton } from "./components/VenmoOneTimePaymentButton";
export { PayPalGuestPaymentButton } from "./components/PayPalGuestPaymentButton";
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
export { usePayPalCreditOneTimePaymentSession } from "./hooks/usePayPalCreditOneTimePaymentSession";
export { usePayPalCreditSavePaymentSession } from "./hooks/usePayPalCreditSavePaymentSession";
export { usePayPalSubscriptionPaymentSession } from "./hooks/usePayPalSubscriptionPaymentSession";

// React 19+ JSX SDK Web Components type declaration
declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace JSX {
        interface IntrinsicElements extends SDKWebComponents {}
    }
}

// React 17/18 JSX SDK Web Components type declaration (for backwards compatibility)
declare module "react" {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace JSX {
        interface IntrinsicElements extends SDKWebComponents {}
    }
}
