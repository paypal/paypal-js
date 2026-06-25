import type { SDKWebComponents } from "./types/sdkWebComponents";

// ============================================================================
// Types
// ============================================================================

export * from "./types";

export type {
  ButtonProps,
  InternalButtonProps,
  PayLaterButtonProps,
  PayPalBasicCardButtonProps,
  PayPalCreditButtonProps,
  PayPalMessagesElement,
} from "./types/sdkWebComponents";

// ============================================================================
// Components
// ============================================================================

export {
  PayPalCardFieldsProvider,
  type CardFieldsSessionType,
} from "./components/PayPalCardFieldsProvider";
export {
  PayLaterOneTimePaymentButton,
  type PayLaterOneTimePaymentButtonProps,
} from "./components/PayLaterOneTimePaymentButton";
export {
  PayPalCreditOneTimePaymentButton,
  type PayPalCreditOneTimePaymentButtonProps,
} from "./components/PayPalCreditOneTimePaymentButton";
export {
  PayPalCreditSavePaymentButton,
  type PayPalCreditSavePaymentButtonProps,
} from "./components/PayPalCreditSavePaymentButton";
export { PayPalGuestPaymentButton } from "./components/PayPalGuestPaymentButton";
export { PayPalOneTimePaymentButton } from "./components/PayPalOneTimePaymentButton";
export {
  PayPalSubscriptionButton,
  type PayPalSubscriptionButtonProps,
} from "./components/PayPalSubscriptionButton";
export { PayPalProvider } from "./components/PayPalProvider";
export { BraintreePayPalProvider } from "./components/Braintree/BraintreePayPalProvider";
export { BraintreePayPalOneTimePaymentButton } from "./components/Braintree/BraintreePayPalOneTimePaymentButton";
export {
  BraintreePayPalBillingAgreementButton,
  type BraintreePayPalBillingAgreementButtonProps,
} from "./components/Braintree/BraintreePayPalBillingAgreementButton";
export {
  BraintreePayPalCheckoutWithVaultButton,
  type BraintreePayPalCheckoutWithVaultButtonProps,
} from "./components/Braintree/BraintreePayPalCheckoutWithVaultButton";
export {
  BraintreePayPalPayLaterButton,
  type BraintreePayPalPayLaterButtonProps,
} from "./components/Braintree/BraintreePayPalPayLaterButton";
export { PayPalSavePaymentButton } from "./components/PayPalSavePaymentButton";
export { VenmoOneTimePaymentButton } from "./components/VenmoOneTimePaymentButton";
export {
  ApplePayOneTimePaymentButton,
  type ApplePayOneTimePaymentButtonProps,
} from "./components/ApplePayOneTimePaymentButton";
export {
  GooglePayOneTimePaymentButton,
  type GooglePayOneTimePaymentButtonProps,
} from "./components/GooglePayOneTimePaymentButton";
export { PayPalCardNumberField } from "./components/PayPalCardNumberField";
export { PayPalCardExpiryField } from "./components/PayPalCardExpiryField";
export { PayPalCardCvvField } from "./components/PayPalCardCvvField";

// ============================================================================
// Hooks
// ============================================================================

// Core hooks
export { usePayPal } from "./hooks/usePayPal";
export { useBraintreePayPal } from "./hooks/Braintree/useBraintreePayPal";

// Braintree hooks
export {
  useBraintreePayPalOneTimePaymentSession,
  type UseBraintreePayPalOneTimePaymentSessionProps,
  type UseBraintreePayPalOneTimePaymentSessionReturn,
} from "./hooks/Braintree/useBraintreePayPalOneTimePaymentSession";
export {
  useBraintreePayPalBillingAgreementSession,
  type UseBraintreePayPalBillingAgreementSessionProps,
  type UseBraintreePayPalBillingAgreementSessionReturn,
} from "./hooks/Braintree/useBraintreePayPalBillingAgreementSession";
export {
  useBraintreePayPalCheckoutWithVaultSession,
  type UseBraintreePayPalCheckoutWithVaultSessionProps,
  type UseBraintreePayPalCheckoutWithVaultSessionReturn,
} from "./hooks/Braintree/useBraintreePayPalCheckoutWithVaultSession";
export {
  useBraintreePayPalPayLaterSession,
  type UseBraintreePayPalPayLaterSessionProps,
  type UseBraintreePayPalPayLaterSessionReturn,
} from "./hooks/Braintree/useBraintreePayPalPayLaterSession";
export {
  useBraintreeEligibleMethods,
  type UseBraintreeEligibleMethodsProps,
  type UseBraintreeEligibleMethodsReturn,
} from "./hooks/Braintree/useBraintreeEligibleMethods";
export {
  useBraintreePayPalMessages,
  type UseBraintreePayPalMessagesProps,
  type UseBraintreePayPalMessagesReturn,
} from "./hooks/Braintree/useBraintreePayPalMessages";
export * from "./hooks/useEligibleMethods";
export { usePayPalMessages } from "./hooks/usePayPalMessages";

// Card fields hooks
export { usePayPalCardFields } from "./hooks/usePayPalCardFields";
export {
  usePayPalCardFieldsOneTimePaymentSession,
  type UsePayPalCardFieldsOneTimePaymentSessionResult,
} from "./hooks/usePayPalCardFieldsOneTimePaymentSession";
export {
  usePayPalCardFieldsSavePaymentSession,
  type UsePayPalCardFieldsSavePaymentSessionResult,
} from "./hooks/usePayPalCardFieldsSavePaymentSession";

// Payment session hooks
export {
  usePayLaterOneTimePaymentSession,
  type UsePayLaterOneTimePaymentSessionProps,
} from "./hooks/usePayLaterOneTimePaymentSession";
export {
  usePayPalCreditOneTimePaymentSession,
  type UsePayPalCreditOneTimePaymentSessionProps,
} from "./hooks/usePayPalCreditOneTimePaymentSession";
export {
  usePayPalCreditSavePaymentSession,
  type UsePayPalCreditSavePaymentSessionProps,
} from "./hooks/usePayPalCreditSavePaymentSession";
export {
  usePayPalGuestPaymentSession,
  type UsePayPalGuestPaymentSessionProps,
} from "./hooks/usePayPalGuestPaymentSession";
export {
  usePayPalOneTimePaymentSession,
  type UsePayPalOneTimePaymentSessionProps,
} from "./hooks/usePayPalOneTimePaymentSession";
export {
  usePayPalSavePaymentSession,
  type UsePayPalSavePaymentSessionProps,
} from "./hooks/usePayPalSavePaymentSession";
export {
  usePayPalSubscriptionPaymentSession,
  type UsePayPalSubscriptionPaymentSessionProps,
} from "./hooks/usePayPalSubscriptionPaymentSession";
export {
  useVenmoOneTimePaymentSession,
  type UseVenmoOneTimePaymentSessionProps,
} from "./hooks/useVenmoOneTimePaymentSession";
export {
  useApplePayOneTimePaymentSession,
  type UseApplePayOneTimePaymentSessionProps,
} from "./hooks/useApplePayOneTimePaymentSession";
export {
  useGooglePayOneTimePaymentSession,
  type UseGooglePayOneTimePaymentSessionProps,
} from "./hooks/useGooglePayOneTimePaymentSession";

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
