export * from "./types";
export { isAndroidMobile, isAndroidWebView, isPostMessageUnreliable, supportsPageVisibility, isBrowser } from "./utils/mobileDetection";
export * from "./context/scriptProviderContext";
export * from "./hooks/scriptProviderHooks";
export { useSubscriptionWatchdog } from "./hooks/useSubscriptionWatchdog";
export type { UseSubscriptionWatchdogOptions, UseSubscriptionWatchdogReturn, SubscriptionStatusResponse } from "./hooks/useSubscriptionWatchdog";
export { usePayPalHostedFields } from "./hooks/payPalHostedFieldsHooks";
export * from "./components/PayPalButtons";
export * from "./components/PayPalSubscriptionButtons";
export * from "./components/braintree/BraintreePayPalButtons";
export * from "./components/PayPalMarks";
export * from "./components/PayPalMessages";
export * from "./components/PayPalScriptProvider";
export * from "./components/hostedFields/PayPalHostedFieldsProvider";
export * from "./components/hostedFields/PayPalHostedField";
export * from "./components/cardFields/PayPalCardFieldsProvider";
export * from "./components/cardFields/PayPalNameField";
export * from "./components/cardFields/PayPalNumberField";
export * from "./components/cardFields/PayPalExpiryField";
export * from "./components/cardFields/PayPalCVVField";
export * from "./components/cardFields/PayPalCardFieldsForm";
export * from "./components/cardFields/context";
export { usePayPalCardFields } from "./components/cardFields/hooks";

import * as constants from "@paypal/sdk-constants/dist/module";

import type { FUNDING_SOURCE } from "@paypal/paypal-js";

// We do not re-export `FUNDING` from the `sdk-constants` module
// directly because it has no type definitions.
//
// See https://github.com/paypal/react-paypal-js/issues/125
export const FUNDING = constants.FUNDING as Record<
    Uppercase<FUNDING_SOURCE>,
    FUNDING_SOURCE
>;
