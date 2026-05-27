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
export { PayPalSavePaymentButton } from "./components/PayPalSavePaymentButton";
export { VenmoOneTimePaymentButton } from "./components/VenmoOneTimePaymentButton";
export {
  ApplePayOneTimePaymentButton,
  type ApplePayOneTimePaymentButtonProps,
} from "./components/ApplePayOneTimePaymentButton";
export {
  LPMOneTimePaymentButton,
  type LPMOneTimePaymentButtonProps,
} from "./components/LPMOneTimePaymentButton";
export { LPM_REGISTRY } from "./config/lpmRegistry";
export type { LPMName } from "./config/lpmRegistry";
// ─── LPM field component prop types + session handle ─────────────────────────
// Hooks (e.g. useIdealOneTimePaymentSession) return pre-bound field components
// (NameField, EmailField…) alongside session data. Buttons are imported
// separately and receive the hook's return value as `paymentSession`.
export type {
  LPMSessionHandle,
  LPMFieldComponentProps,
  LPMButtonComponentProps,
} from "./components/LPMPaymentProvider";

// ─── Named LPM payment buttons ────────────────────────────────────────────────
// Import the button for your LPM, then pass the hook's return value as
// the `paymentSession` prop. No Provider — the button can live anywhere.
export {
  IdealPaymentButton,
  BancontactPaymentButton,
  EpsPaymentButton,
  BlikPaymentButton,
  MybankPaymentButton,
  TrustlyPaymentButton,
  P24PaymentButton,
  MultibancoPaymentButton,
  BizumPaymentButton,
  SwishPaymentButton,
  KlarnaPaymentButton,
  TwintPaymentButton,
  WechatpayPaymentButton,
  AfterpayPaymentButton,
  OxxopayPaymentButton,
  BoletobancarioPaymentButton,
  VerkkopankkiPaymentButton,
  PayuPaymentButton,
  PaysafecardPaymentButton,
  MbwayPaymentButton,
  SatispayPaymentButton,
  WeroPaymentButton,
  FloaPaymentButton,
  ScalapayPaymentButton,
  GrabpayPaymentButton,
  PixInternationalPaymentButton,
  SepaPaymentButton,
  CryptoPaymentButton,
  DokuPaymentButton,
  DragonpayPaymentButton,
  EstoniaPaymentButton,
  FpxPaymentButton,
  GopayPaymentButton,
  AlipayPaymentButton,
  IndomaretPaymentButton,
  IndonesiaBanksPaymentButton,
  KredivoPaymentButton,
  LinkajaPaymentButton,
  OvoPaymentButton,
  PayseraPaymentButton,
  SkrillPaymentButton,
  ThailandBanksPaymentButton,
  BlikPayLaterPaymentButton,
  AlfamartPaymentButton,
  ZipPaymentButton,
  BancomatPayPaymentButton,
  LatviaBanksPaymentButton,
  FiuuPaymentButton,
  LithuaniaBanksPaymentButton,
  JeniuspayPaymentButton,
} from "./lpmProviderExports";

// Factory-generated named LPM button components
export {
  IdealOneTimePaymentButton,
  BancontactOneTimePaymentButton,
  EpsOneTimePaymentButton,
  BlikOneTimePaymentButton,
  MybankOneTimePaymentButton,
  TrustlyOneTimePaymentButton,
  P24OneTimePaymentButton,
  MultibancoOneTimePaymentButton,
  BizumOneTimePaymentButton,
  SwishOneTimePaymentButton,
  KlarnaOneTimePaymentButton,
  TwintOneTimePaymentButton,
  WechatpayOneTimePaymentButton,
  AfterpayOneTimePaymentButton,
  OxxopayOneTimePaymentButton,
  BoletobancarioOneTimePaymentButton,
  VerkkopankkiOneTimePaymentButton,
  PayuOneTimePaymentButton,
  PaysafecardOneTimePaymentButton,
  MbwayOneTimePaymentButton,
  SatispayOneTimePaymentButton,
  WeroOneTimePaymentButton,
  FloaOneTimePaymentButton,
  ScalapayOneTimePaymentButton,
  GrabpayOneTimePaymentButton,
  PixInternationalOneTimePaymentButton,
  SepaOneTimePaymentButton,
  CryptoOneTimePaymentButton,
  DokuOneTimePaymentButton,
  DragonpayOneTimePaymentButton,
  EstoniaOneTimePaymentButton,
  FpxOneTimePaymentButton,
  GopayOneTimePaymentButton,
  AlipayOneTimePaymentButton,
  IndomaretOneTimePaymentButton,
  IndonesiaBanksOneTimePaymentButton,
  KredivoOneTimePaymentButton,
  LinkajaOneTimePaymentButton,
  OvoOneTimePaymentButton,
  PayseraOneTimePaymentButton,
  SkrillOneTimePaymentButton,
  ThailandBanksOneTimePaymentButton,
  BlikPayLaterOneTimePaymentButton,
  AlfamartOneTimePaymentButton,
  ZipOneTimePaymentButton,
  BancomatPayOneTimePaymentButton,
  LatviaBanksOneTimePaymentButton,
  FiuuOneTimePaymentButton,
  LithuaniaBanksOneTimePaymentButton,
  JeniuspayOneTimePaymentButton,
  type IdealOneTimePaymentButtonProps,
  type BancontactOneTimePaymentButtonProps,
  type EpsOneTimePaymentButtonProps,
  type BlikOneTimePaymentButtonProps,
} from "./lpmExports";
export { PayPalCardNumberField } from "./components/PayPalCardNumberField";
export { PayPalCardExpiryField } from "./components/PayPalCardExpiryField";
export { PayPalCardCvvField } from "./components/PayPalCardCvvField";

// ============================================================================
// Hooks
// ============================================================================

// Core hooks
export { usePayPal } from "./hooks/usePayPal";
export { useBraintreePayPal } from "./hooks/Braintree/useBraintreePayPal";
export {
  useBraintreePayPalOneTimePaymentSession,
  type UseBraintreePayPalOneTimePaymentSessionProps,
  type UseBraintreePayPalOneTimePaymentSessionReturn,
} from "./hooks/Braintree/useBraintreePayPalOneTimePaymentSession";
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
// Generic LPM hook
export {
  useLPMOneTimePaymentSession,
  type UseLPMOneTimePaymentSessionProps,
  type LPMPaymentSessionReturn,
} from "./hooks/useLPMOneTimePaymentSession";
// Factory-generated named LPM hooks
export {
  useIdealOneTimePaymentSession,
  useBancontactOneTimePaymentSession,
  useEpsOneTimePaymentSession,
  useBlikOneTimePaymentSession,
  useMybankOneTimePaymentSession,
  useTrustlyOneTimePaymentSession,
  useP24OneTimePaymentSession,
  useMultibancoOneTimePaymentSession,
  useBizumOneTimePaymentSession,
  useSwishOneTimePaymentSession,
  useKlarnaOneTimePaymentSession,
  useTwintOneTimePaymentSession,
  useWechatpayOneTimePaymentSession,
  useAfterpayOneTimePaymentSession,
  useOxxopayOneTimePaymentSession,
  useBoletobancarioOneTimePaymentSession,
  useVerkkopankkiOneTimePaymentSession,
  usePayuOneTimePaymentSession,
  usePaysafecardOneTimePaymentSession,
  useMbwayOneTimePaymentSession,
  useSatispayOneTimePaymentSession,
  useWeroOneTimePaymentSession,
  useFloaOneTimePaymentSession,
  useScalapayOneTimePaymentSession,
  useGrabpayOneTimePaymentSession,
  usePixInternationalOneTimePaymentSession,
  useSepaOneTimePaymentSession,
  useCryptoOneTimePaymentSession,
  useDokuOneTimePaymentSession,
  useDragonpayOneTimePaymentSession,
  useEstoniaOneTimePaymentSession,
  useFpxOneTimePaymentSession,
  useGopayOneTimePaymentSession,
  useAlipayOneTimePaymentSession,
  useIndomaretOneTimePaymentSession,
  useIndonesiaBanksOneTimePaymentSession,
  useKredivoOneTimePaymentSession,
  useLinkajaOneTimePaymentSession,
  useOvoOneTimePaymentSession,
  usePayseraOneTimePaymentSession,
  useSkrillOneTimePaymentSession,
  useThailandBanksOneTimePaymentSession,
  useBlikPayLaterOneTimePaymentSession,
  useAlfamartOneTimePaymentSession,
  useZipOneTimePaymentSession,
  useBancomatPayOneTimePaymentSession,
  useLatviaBanksOneTimePaymentSession,
  useFiuuOneTimePaymentSession,
  useLithuaniaBanksOneTimePaymentSession,
  useJeniuspayOneTimePaymentSession,
  type UseIdealOneTimePaymentSessionProps,
  type UseBancontactOneTimePaymentSessionProps,
  type UseEpsOneTimePaymentSessionProps,
  type UseBlikOneTimePaymentSessionProps,
  type UseMybankOneTimePaymentSessionProps,
  type UseTrustlyOneTimePaymentSessionProps,
  type UseP24OneTimePaymentSessionProps,
  type UseMultibancoOneTimePaymentSessionProps,
  type UseBizumOneTimePaymentSessionProps,
  type UseSwishOneTimePaymentSessionProps,
  type UseKlarnaOneTimePaymentSessionProps,
  type UseTwintOneTimePaymentSessionProps,
  type UseWechatpayOneTimePaymentSessionProps,
  type UseAfterpayOneTimePaymentSessionProps,
  type UseOxxopayOneTimePaymentSessionProps,
  type UseBoletobancarioOneTimePaymentSessionProps,
  type UseVerkkopankkiOneTimePaymentSessionProps,
  type UsePayuOneTimePaymentSessionProps,
  type UsePaysafecardOneTimePaymentSessionProps,
  type UseMbwayOneTimePaymentSessionProps,
  type UseSatispayOneTimePaymentSessionProps,
  type UseWeroOneTimePaymentSessionProps,
  type UseFloaOneTimePaymentSessionProps,
  type UseScalapayOneTimePaymentSessionProps,
  type UseGrabpayOneTimePaymentSessionProps,
  type UsePixInternationalOneTimePaymentSessionProps,
  type UseSepaOneTimePaymentSessionProps,
  type UseCryptoOneTimePaymentSessionProps,
  type UseDokuOneTimePaymentSessionProps,
  type UseDragonpayOneTimePaymentSessionProps,
  type UseEstoniaOneTimePaymentSessionProps,
  type UseFpxOneTimePaymentSessionProps,
  type UseGopayOneTimePaymentSessionProps,
  type UseAlipayOneTimePaymentSessionProps,
  type UseIndomaretOneTimePaymentSessionProps,
  type UseIndonesiaBanksOneTimePaymentSessionProps,
  type UseKredivoOneTimePaymentSessionProps,
  type UseLinkajaOneTimePaymentSessionProps,
  type UseOvoOneTimePaymentSessionProps,
  type UsePayseraOneTimePaymentSessionProps,
  type UseSkrillOneTimePaymentSessionProps,
  type UseThailandBanksOneTimePaymentSessionProps,
  type UseBlikPayLaterOneTimePaymentSessionProps,
  type UseAlfamartOneTimePaymentSessionProps,
  type UseZipOneTimePaymentSessionProps,
  type UseBancomatPayOneTimePaymentSessionProps,
  type UseLatviaBanksOneTimePaymentSessionProps,
  type UseFiuuOneTimePaymentSessionProps,
  type UseLithuaniaBanksOneTimePaymentSessionProps,
  type UseJeniuspayOneTimePaymentSessionProps,
} from "./lpmExports";

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
