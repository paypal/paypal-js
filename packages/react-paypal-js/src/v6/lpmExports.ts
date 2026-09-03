import React from "react";

import {
  LPMOneTimePaymentButton,
  type LPMOneTimePaymentButtonProps,
} from "./components/LPMOneTimePaymentButton";
import { LPM_REGISTRY } from "./config/lpmRegistry";
import {
  createLPMButtonComponent,
  createEnhancedLPMHook,
  LPMSessionContext,
  LPMSessionHandleContext,
  type LPMSessionHandle,
  type LPMSessionHandleContextValue,
  type LPMButtonComponentProps,
  type LPMFieldComponentProps,
  type LPMEnhancedHookReturn,
} from "./components/LPMPaymentProvider";

import type { UseLPMOneTimePaymentSessionProps } from "./hooks/useLPMOneTimePaymentSession";
import type { LPMName } from "./config/lpmRegistry";

export { LPMSessionContext, LPMSessionHandleContext };
export type {
  LPMSessionHandle,
  LPMSessionHandleContextValue,
  LPMButtonComponentProps,
  LPMFieldComponentProps,
  LPMEnhancedHookReturn,
};

type NamedLPMButtonProps = Omit<LPMOneTimePaymentButtonProps, "lpm">;
type NamedLPMHookProps = Omit<UseLPMOneTimePaymentSessionProps, "lpm">;

function createLPMButton(lpm: LPMName) {
  const Component = (props: NamedLPMButtonProps): JSX.Element | null =>
    React.createElement(LPMOneTimePaymentButton, {
      lpm,
      ...props,
    } as LPMOneTimePaymentButtonProps);
  Component.displayName = `${LPM_REGISTRY[lpm].displayName}OneTimePaymentButton`;
  return Component;
}

function createLPMHook<const L extends LPMName>(lpm: L) {
  return createEnhancedLPMHook(lpm, LPM_REGISTRY[lpm].fields);
}

function createStandaloneLPMButton(lpm: LPMName, displayName: string) {
  return createLPMButtonComponent(LPM_REGISTRY[lpm].buttonTag, displayName);
}

// Named Button Components
export const IdealOneTimePaymentButton = /*#__PURE__*/ createLPMButton("ideal");
export const BancontactOneTimePaymentButton =
  /*#__PURE__*/ createLPMButton("bancontact");
export const EpsOneTimePaymentButton = /*#__PURE__*/ createLPMButton("eps");
export const BlikOneTimePaymentButton = /*#__PURE__*/ createLPMButton("blik");
export const MybankOneTimePaymentButton =
  /*#__PURE__*/ createLPMButton("mybank");
export const TrustlyOneTimePaymentButton =
  /*#__PURE__*/ createLPMButton("trustly");
export const P24OneTimePaymentButton = /*#__PURE__*/ createLPMButton("p24");
export const MultibancoOneTimePaymentButton =
  /*#__PURE__*/ createLPMButton("multibanco");
export const BizumOneTimePaymentButton = /*#__PURE__*/ createLPMButton("bizum");
export const SwishOneTimePaymentButton = /*#__PURE__*/ createLPMButton("swish");
export const TwintOneTimePaymentButton = /*#__PURE__*/ createLPMButton("twint");
export const WechatpayOneTimePaymentButton =
  /*#__PURE__*/ createLPMButton("wechatpay");
export const VerkkopankkiOneTimePaymentButton =
  /*#__PURE__*/ createLPMButton("verkkopankki");
export const PayuOneTimePaymentButton = /*#__PURE__*/ createLPMButton("payu");
export const MbwayOneTimePaymentButton = /*#__PURE__*/ createLPMButton("mbway");
export const SatispayOneTimePaymentButton =
  /*#__PURE__*/ createLPMButton("satispay");
export const WeroOneTimePaymentButton = /*#__PURE__*/ createLPMButton("wero");
export const FloaOneTimePaymentButton = /*#__PURE__*/ createLPMButton("floa");
export const GrabpayOneTimePaymentButton =
  /*#__PURE__*/ createLPMButton("grabpay");
export const PixInternationalOneTimePaymentButton =
  /*#__PURE__*/ createLPMButton("pixInternational");
export const SepaOneTimePaymentButton = /*#__PURE__*/ createLPMButton("sepa");
export const DokuOneTimePaymentButton = /*#__PURE__*/ createLPMButton("doku");
export const EstoniaOneTimePaymentButton =
  /*#__PURE__*/ createLPMButton("estonia");
export const GopayOneTimePaymentButton = /*#__PURE__*/ createLPMButton("gopay");
export const AlipayOneTimePaymentButton =
  /*#__PURE__*/ createLPMButton("alipay");
export const IndonesiaBanksOneTimePaymentButton =
  /*#__PURE__*/ createLPMButton("indonesiaBanks");
export const KredivoOneTimePaymentButton =
  /*#__PURE__*/ createLPMButton("kredivo");
export const LinkajaOneTimePaymentButton =
  /*#__PURE__*/ createLPMButton("linkaja");
export const OvoOneTimePaymentButton = /*#__PURE__*/ createLPMButton("ovo");
export const PayseraOneTimePaymentButton =
  /*#__PURE__*/ createLPMButton("paysera");
export const SkrillOneTimePaymentButton =
  /*#__PURE__*/ createLPMButton("skrill");
export const BlikPayLaterOneTimePaymentButton =
  /*#__PURE__*/ createLPMButton("blikPayLater");
export const BancomatPayOneTimePaymentButton =
  /*#__PURE__*/ createLPMButton("bancomatPay");
export const JeniuspayOneTimePaymentButton =
  /*#__PURE__*/ createLPMButton("jeniuspay");
export const KlarnaOneTimePaymentButton =
  /*#__PURE__*/ createLPMButton("klarna");
export const AfterpayOneTimePaymentButton =
  /*#__PURE__*/ createLPMButton("afterpay");
export const OxxopayOneTimePaymentButton =
  /*#__PURE__*/ createLPMButton("oxxopay");
export const BoletobancarioOneTimePaymentButton =
  /*#__PURE__*/ createLPMButton("boletobancario");
export const PaysafecardOneTimePaymentButton =
  /*#__PURE__*/ createLPMButton("paysafecard");
export const ScalapayOneTimePaymentButton =
  /*#__PURE__*/ createLPMButton("scalapay");
export const CryptoOneTimePaymentButton =
  /*#__PURE__*/ createLPMButton("crypto");
export const DragonpayOneTimePaymentButton =
  /*#__PURE__*/ createLPMButton("dragonpay");
export const FpxOneTimePaymentButton = /*#__PURE__*/ createLPMButton("fpx");
export const IndomaretOneTimePaymentButton =
  /*#__PURE__*/ createLPMButton("indomaret");
export const ThailandBanksOneTimePaymentButton =
  /*#__PURE__*/ createLPMButton("thailandBanks");
export const AlfamartOneTimePaymentButton =
  /*#__PURE__*/ createLPMButton("alfamart");
export const ZipOneTimePaymentButton = /*#__PURE__*/ createLPMButton("zip");
export const LatviaBanksOneTimePaymentButton =
  /*#__PURE__*/ createLPMButton("latviaBanks");
export const FiuuOneTimePaymentButton = /*#__PURE__*/ createLPMButton("fiuu");
export const LithuaniaBanksOneTimePaymentButton =
  /*#__PURE__*/ createLPMButton("lithuaniaBanks");

// Button prop type aliases
export type IdealOneTimePaymentButtonProps = NamedLPMButtonProps;
export type BancontactOneTimePaymentButtonProps = NamedLPMButtonProps;
export type EpsOneTimePaymentButtonProps = NamedLPMButtonProps;
export type BlikOneTimePaymentButtonProps = NamedLPMButtonProps;
export type MybankOneTimePaymentButtonProps = NamedLPMButtonProps;
export type TrustlyOneTimePaymentButtonProps = NamedLPMButtonProps;
export type P24OneTimePaymentButtonProps = NamedLPMButtonProps;
export type MultibancoOneTimePaymentButtonProps = NamedLPMButtonProps;
export type BizumOneTimePaymentButtonProps = NamedLPMButtonProps;
export type SwishOneTimePaymentButtonProps = NamedLPMButtonProps;
export type TwintOneTimePaymentButtonProps = NamedLPMButtonProps;
export type WechatpayOneTimePaymentButtonProps = NamedLPMButtonProps;
export type VerkkopankkiOneTimePaymentButtonProps = NamedLPMButtonProps;
export type PayuOneTimePaymentButtonProps = NamedLPMButtonProps;
export type MbwayOneTimePaymentButtonProps = NamedLPMButtonProps;
export type SatispayOneTimePaymentButtonProps = NamedLPMButtonProps;
export type WeroOneTimePaymentButtonProps = NamedLPMButtonProps;
export type FloaOneTimePaymentButtonProps = NamedLPMButtonProps;
export type GrabpayOneTimePaymentButtonProps = NamedLPMButtonProps;
export type PixInternationalOneTimePaymentButtonProps = NamedLPMButtonProps;
export type SepaOneTimePaymentButtonProps = NamedLPMButtonProps;
export type DokuOneTimePaymentButtonProps = NamedLPMButtonProps;
export type EstoniaOneTimePaymentButtonProps = NamedLPMButtonProps;
export type GopayOneTimePaymentButtonProps = NamedLPMButtonProps;
export type AlipayOneTimePaymentButtonProps = NamedLPMButtonProps;
export type IndonesiaBanksOneTimePaymentButtonProps = NamedLPMButtonProps;
export type KredivoOneTimePaymentButtonProps = NamedLPMButtonProps;
export type LinkajaOneTimePaymentButtonProps = NamedLPMButtonProps;
export type OvoOneTimePaymentButtonProps = NamedLPMButtonProps;
export type PayseraOneTimePaymentButtonProps = NamedLPMButtonProps;
export type SkrillOneTimePaymentButtonProps = NamedLPMButtonProps;
export type BlikPayLaterOneTimePaymentButtonProps = NamedLPMButtonProps;
export type BancomatPayOneTimePaymentButtonProps = NamedLPMButtonProps;
export type JeniuspayOneTimePaymentButtonProps = NamedLPMButtonProps;
export type KlarnaOneTimePaymentButtonProps = NamedLPMButtonProps;
export type AfterpayOneTimePaymentButtonProps = NamedLPMButtonProps;
export type OxxopayOneTimePaymentButtonProps = NamedLPMButtonProps;
export type BoletobancarioOneTimePaymentButtonProps = NamedLPMButtonProps;
export type PaysafecardOneTimePaymentButtonProps = NamedLPMButtonProps;
export type ScalapayOneTimePaymentButtonProps = NamedLPMButtonProps;
export type CryptoOneTimePaymentButtonProps = NamedLPMButtonProps;
export type DragonpayOneTimePaymentButtonProps = NamedLPMButtonProps;
export type FpxOneTimePaymentButtonProps = NamedLPMButtonProps;
export type IndomaretOneTimePaymentButtonProps = NamedLPMButtonProps;
export type ThailandBanksOneTimePaymentButtonProps = NamedLPMButtonProps;
export type AlfamartOneTimePaymentButtonProps = NamedLPMButtonProps;
export type ZipOneTimePaymentButtonProps = NamedLPMButtonProps;
export type LatviaBanksOneTimePaymentButtonProps = NamedLPMButtonProps;
export type FiuuOneTimePaymentButtonProps = NamedLPMButtonProps;
export type LithuaniaBanksOneTimePaymentButtonProps = NamedLPMButtonProps;

// Named Hooks
export const useIdealOneTimePaymentSession =
  /*#__PURE__*/ createLPMHook("ideal");
export const useBancontactOneTimePaymentSession =
  /*#__PURE__*/ createLPMHook("bancontact");
export const useEpsOneTimePaymentSession = /*#__PURE__*/ createLPMHook("eps");
export const useBlikOneTimePaymentSession = /*#__PURE__*/ createLPMHook("blik");
export const useMybankOneTimePaymentSession =
  /*#__PURE__*/ createLPMHook("mybank");
export const useTrustlyOneTimePaymentSession =
  /*#__PURE__*/ createLPMHook("trustly");
export const useP24OneTimePaymentSession = /*#__PURE__*/ createLPMHook("p24");
export const useMultibancoOneTimePaymentSession =
  /*#__PURE__*/ createLPMHook("multibanco");
export const useBizumOneTimePaymentSession =
  /*#__PURE__*/ createLPMHook("bizum");
export const useSwishOneTimePaymentSession =
  /*#__PURE__*/ createLPMHook("swish");
export const useTwintOneTimePaymentSession =
  /*#__PURE__*/ createLPMHook("twint");
export const useWechatpayOneTimePaymentSession =
  /*#__PURE__*/ createLPMHook("wechatpay");
export const useVerkkopankkiOneTimePaymentSession =
  /*#__PURE__*/ createLPMHook("verkkopankki");
export const usePayuOneTimePaymentSession = /*#__PURE__*/ createLPMHook("payu");
export const useMbwayOneTimePaymentSession =
  /*#__PURE__*/ createLPMHook("mbway");
export const useSatispayOneTimePaymentSession =
  /*#__PURE__*/ createLPMHook("satispay");
export const useWeroOneTimePaymentSession = /*#__PURE__*/ createLPMHook("wero");
export const useFloaOneTimePaymentSession = /*#__PURE__*/ createLPMHook("floa");
export const useGrabpayOneTimePaymentSession =
  /*#__PURE__*/ createLPMHook("grabpay");
export const usePixInternationalOneTimePaymentSession =
  /*#__PURE__*/ createLPMHook("pixInternational");
export const useSepaOneTimePaymentSession = /*#__PURE__*/ createLPMHook("sepa");
export const useDokuOneTimePaymentSession = /*#__PURE__*/ createLPMHook("doku");
export const useEstoniaOneTimePaymentSession =
  /*#__PURE__*/ createLPMHook("estonia");
export const useGopayOneTimePaymentSession =
  /*#__PURE__*/ createLPMHook("gopay");
export const useAlipayOneTimePaymentSession =
  /*#__PURE__*/ createLPMHook("alipay");
export const useIndonesiaBanksOneTimePaymentSession =
  /*#__PURE__*/ createLPMHook("indonesiaBanks");
export const useKredivoOneTimePaymentSession =
  /*#__PURE__*/ createLPMHook("kredivo");
export const useLinkajaOneTimePaymentSession =
  /*#__PURE__*/ createLPMHook("linkaja");
export const useOvoOneTimePaymentSession = /*#__PURE__*/ createLPMHook("ovo");
export const usePayseraOneTimePaymentSession =
  /*#__PURE__*/ createLPMHook("paysera");
export const useSkrillOneTimePaymentSession =
  /*#__PURE__*/ createLPMHook("skrill");
export const useBlikPayLaterOneTimePaymentSession =
  /*#__PURE__*/ createLPMHook("blikPayLater");
export const useBancomatPayOneTimePaymentSession =
  /*#__PURE__*/ createLPMHook("bancomatPay");
export const useJeniuspayOneTimePaymentSession =
  /*#__PURE__*/ createLPMHook("jeniuspay");
export const useKlarnaOneTimePaymentSession =
  /*#__PURE__*/ createLPMHook("klarna");
export const useAfterpayOneTimePaymentSession =
  /*#__PURE__*/ createLPMHook("afterpay");
export const useOxxopayOneTimePaymentSession =
  /*#__PURE__*/ createLPMHook("oxxopay");
export const useBoletobancarioOneTimePaymentSession =
  /*#__PURE__*/ createLPMHook("boletobancario");
export const usePaysafecardOneTimePaymentSession =
  /*#__PURE__*/ createLPMHook("paysafecard");
export const useScalapayOneTimePaymentSession =
  /*#__PURE__*/ createLPMHook("scalapay");
export const useCryptoOneTimePaymentSession =
  /*#__PURE__*/ createLPMHook("crypto");
export const useDragonpayOneTimePaymentSession =
  /*#__PURE__*/ createLPMHook("dragonpay");
export const useFpxOneTimePaymentSession = /*#__PURE__*/ createLPMHook("fpx");
export const useIndomaretOneTimePaymentSession =
  /*#__PURE__*/ createLPMHook("indomaret");
export const useThailandBanksOneTimePaymentSession =
  /*#__PURE__*/ createLPMHook("thailandBanks");
export const useAlfamartOneTimePaymentSession =
  /*#__PURE__*/ createLPMHook("alfamart");
export const useZipOneTimePaymentSession = /*#__PURE__*/ createLPMHook("zip");
export const useLatviaBanksOneTimePaymentSession =
  /*#__PURE__*/ createLPMHook("latviaBanks");
export const useFiuuOneTimePaymentSession = /*#__PURE__*/ createLPMHook("fiuu");
export const useLithuaniaBanksOneTimePaymentSession =
  /*#__PURE__*/ createLPMHook("lithuaniaBanks");

// Provider + context utilities are re-exported through the single ./sdk-v6
// public entry so PayPal and LPM components share the same React context.
export { PayPalProvider } from "./components/PayPalProvider";
export { usePayPal } from "./hooks/usePayPal";
export { INSTANCE_LOADING_STATE } from "./types/ProviderEnums";

// Generic LPM exports are also exposed through the single ./sdk-v6 entry.
export {
  LPMOneTimePaymentButton,
  type LPMOneTimePaymentButtonProps,
} from "./components/LPMOneTimePaymentButton";
export { LPM_REGISTRY } from "./config/lpmRegistry";
export type { LPMName } from "./config/lpmRegistry";
export {
  useLPMOneTimePaymentSession,
  type UseLPMOneTimePaymentSessionProps,
  type LPMPaymentSessionReturn,
} from "./hooks/useLPMOneTimePaymentSession";

// Hook prop type aliases
export type UseIdealOneTimePaymentSessionProps = NamedLPMHookProps;
export type UseBancontactOneTimePaymentSessionProps = NamedLPMHookProps;
export type UseEpsOneTimePaymentSessionProps = NamedLPMHookProps;
export type UseBlikOneTimePaymentSessionProps = NamedLPMHookProps;
export type UseMybankOneTimePaymentSessionProps = NamedLPMHookProps;
export type UseTrustlyOneTimePaymentSessionProps = NamedLPMHookProps;
export type UseP24OneTimePaymentSessionProps = NamedLPMHookProps;
export type UseMultibancoOneTimePaymentSessionProps = NamedLPMHookProps;
export type UseBizumOneTimePaymentSessionProps = NamedLPMHookProps;
export type UseSwishOneTimePaymentSessionProps = NamedLPMHookProps;
export type UseTwintOneTimePaymentSessionProps = NamedLPMHookProps;
export type UseWechatpayOneTimePaymentSessionProps = NamedLPMHookProps;
export type UseVerkkopankkiOneTimePaymentSessionProps = NamedLPMHookProps;
export type UsePayuOneTimePaymentSessionProps = NamedLPMHookProps;
export type UseMbwayOneTimePaymentSessionProps = NamedLPMHookProps;
export type UseSatispayOneTimePaymentSessionProps = NamedLPMHookProps;
export type UseWeroOneTimePaymentSessionProps = NamedLPMHookProps;
export type UseFloaOneTimePaymentSessionProps = NamedLPMHookProps;
export type UseGrabpayOneTimePaymentSessionProps = NamedLPMHookProps;
export type UsePixInternationalOneTimePaymentSessionProps = NamedLPMHookProps;
export type UseSepaOneTimePaymentSessionProps = NamedLPMHookProps;
export type UseDokuOneTimePaymentSessionProps = NamedLPMHookProps;
export type UseEstoniaOneTimePaymentSessionProps = NamedLPMHookProps;
export type UseGopayOneTimePaymentSessionProps = NamedLPMHookProps;
export type UseAlipayOneTimePaymentSessionProps = NamedLPMHookProps;
export type UseIndonesiaBanksOneTimePaymentSessionProps = NamedLPMHookProps;
export type UseKredivoOneTimePaymentSessionProps = NamedLPMHookProps;
export type UseLinkajaOneTimePaymentSessionProps = NamedLPMHookProps;
export type UseOvoOneTimePaymentSessionProps = NamedLPMHookProps;
export type UsePayseraOneTimePaymentSessionProps = NamedLPMHookProps;
export type UseSkrillOneTimePaymentSessionProps = NamedLPMHookProps;
export type UseBlikPayLaterOneTimePaymentSessionProps = NamedLPMHookProps;
export type UseBancomatPayOneTimePaymentSessionProps = NamedLPMHookProps;
export type UseJeniuspayOneTimePaymentSessionProps = NamedLPMHookProps;
export type UseKlarnaOneTimePaymentSessionProps = NamedLPMHookProps;
export type UseAfterpayOneTimePaymentSessionProps = NamedLPMHookProps;
export type UseOxxopayOneTimePaymentSessionProps = NamedLPMHookProps;
export type UseBoletobancarioOneTimePaymentSessionProps = NamedLPMHookProps;
export type UsePaysafecardOneTimePaymentSessionProps = NamedLPMHookProps;
export type UseScalapayOneTimePaymentSessionProps = NamedLPMHookProps;
export type UseCryptoOneTimePaymentSessionProps = NamedLPMHookProps;
export type UseDragonpayOneTimePaymentSessionProps = NamedLPMHookProps;
export type UseFpxOneTimePaymentSessionProps = NamedLPMHookProps;
export type UseIndomaretOneTimePaymentSessionProps = NamedLPMHookProps;
export type UseThailandBanksOneTimePaymentSessionProps = NamedLPMHookProps;
export type UseAlfamartOneTimePaymentSessionProps = NamedLPMHookProps;
export type UseZipOneTimePaymentSessionProps = NamedLPMHookProps;
export type UseLatviaBanksOneTimePaymentSessionProps = NamedLPMHookProps;
export type UseFiuuOneTimePaymentSessionProps = NamedLPMHookProps;
export type UseLithuaniaBanksOneTimePaymentSessionProps = NamedLPMHookProps;

// ─── Named standalone button components ───────────────────────────────────────
// Read session state from LPMSessionHandleContext — render inside the
// LPMSessionProvider returned by the corresponding use*OneTimePaymentSession hook.
export const IdealPaymentButton = /*#__PURE__*/ createStandaloneLPMButton(
  "ideal",
  "IdealPaymentButton",
);
export const BancontactPaymentButton = /*#__PURE__*/ createStandaloneLPMButton(
  "bancontact",
  "BancontactPaymentButton",
);
export const EpsPaymentButton = /*#__PURE__*/ createStandaloneLPMButton(
  "eps",
  "EpsPaymentButton",
);
export const BlikPaymentButton = /*#__PURE__*/ createStandaloneLPMButton(
  "blik",
  "BlikPaymentButton",
);
export const MybankPaymentButton = /*#__PURE__*/ createStandaloneLPMButton(
  "mybank",
  "MybankPaymentButton",
);
export const TrustlyPaymentButton = /*#__PURE__*/ createStandaloneLPMButton(
  "trustly",
  "TrustlyPaymentButton",
);
export const P24PaymentButton = /*#__PURE__*/ createStandaloneLPMButton(
  "p24",
  "P24PaymentButton",
);
export const MultibancoPaymentButton = /*#__PURE__*/ createStandaloneLPMButton(
  "multibanco",
  "MultibancoPaymentButton",
);
export const BizumPaymentButton = /*#__PURE__*/ createStandaloneLPMButton(
  "bizum",
  "BizumPaymentButton",
);
export const SwishPaymentButton = /*#__PURE__*/ createStandaloneLPMButton(
  "swish",
  "SwishPaymentButton",
);
export const TwintPaymentButton = /*#__PURE__*/ createStandaloneLPMButton(
  "twint",
  "TwintPaymentButton",
);
export const WechatpayPaymentButton = /*#__PURE__*/ createStandaloneLPMButton(
  "wechatpay",
  "WechatpayPaymentButton",
);
export const VerkkopankkiPaymentButton =
  /*#__PURE__*/ createStandaloneLPMButton(
    "verkkopankki",
    "VerkkopankkiPaymentButton",
  );
export const PayuPaymentButton = /*#__PURE__*/ createStandaloneLPMButton(
  "payu",
  "PayuPaymentButton",
);
export const MbwayPaymentButton = /*#__PURE__*/ createStandaloneLPMButton(
  "mbway",
  "MbwayPaymentButton",
);
export const SatispayPaymentButton = /*#__PURE__*/ createStandaloneLPMButton(
  "satispay",
  "SatispayPaymentButton",
);
export const WeroPaymentButton = /*#__PURE__*/ createStandaloneLPMButton(
  "wero",
  "WeroPaymentButton",
);
export const FloaPaymentButton = /*#__PURE__*/ createStandaloneLPMButton(
  "floa",
  "FloaPaymentButton",
);
export const GrabpayPaymentButton = /*#__PURE__*/ createStandaloneLPMButton(
  "grabpay",
  "GrabpayPaymentButton",
);
export const PixInternationalPaymentButton =
  /*#__PURE__*/ createStandaloneLPMButton(
    "pixInternational",
    "PixInternationalPaymentButton",
  );
export const SepaPaymentButton = /*#__PURE__*/ createStandaloneLPMButton(
  "sepa",
  "SepaPaymentButton",
);
export const DokuPaymentButton = /*#__PURE__*/ createStandaloneLPMButton(
  "doku",
  "DokuPaymentButton",
);
export const EstoniaPaymentButton = /*#__PURE__*/ createStandaloneLPMButton(
  "estonia",
  "EstoniaPaymentButton",
);
export const GopayPaymentButton = /*#__PURE__*/ createStandaloneLPMButton(
  "gopay",
  "GopayPaymentButton",
);
export const AlipayPaymentButton = /*#__PURE__*/ createStandaloneLPMButton(
  "alipay",
  "AlipayPaymentButton",
);
export const IndonesiaBanksPaymentButton =
  /*#__PURE__*/ createStandaloneLPMButton(
    "indonesiaBanks",
    "IndonesiaBanksPaymentButton",
  );
export const KredivoPaymentButton = /*#__PURE__*/ createStandaloneLPMButton(
  "kredivo",
  "KredivoPaymentButton",
);
export const LinkajaPaymentButton = /*#__PURE__*/ createStandaloneLPMButton(
  "linkaja",
  "LinkajaPaymentButton",
);
export const OvoPaymentButton = /*#__PURE__*/ createStandaloneLPMButton(
  "ovo",
  "OvoPaymentButton",
);
export const PayseraPaymentButton = /*#__PURE__*/ createStandaloneLPMButton(
  "paysera",
  "PayseraPaymentButton",
);
export const SkrillPaymentButton = /*#__PURE__*/ createStandaloneLPMButton(
  "skrill",
  "SkrillPaymentButton",
);
export const BlikPayLaterPaymentButton =
  /*#__PURE__*/ createStandaloneLPMButton(
    "blikPayLater",
    "BlikPayLaterPaymentButton",
  );
export const BancomatPayPaymentButton = /*#__PURE__*/ createStandaloneLPMButton(
  "bancomatPay",
  "BancomatPayPaymentButton",
);
export const JeniuspayPaymentButton = /*#__PURE__*/ createStandaloneLPMButton(
  "jeniuspay",
  "JeniuspayPaymentButton",
);
export const KlarnaPaymentButton = /*#__PURE__*/ createStandaloneLPMButton(
  "klarna",
  "KlarnaPaymentButton",
);
export const AfterpayPaymentButton = /*#__PURE__*/ createStandaloneLPMButton(
  "afterpay",
  "AfterpayPaymentButton",
);
export const OxxopayPaymentButton = /*#__PURE__*/ createStandaloneLPMButton(
  "oxxopay",
  "OxxopayPaymentButton",
);
export const BoletobancarioPaymentButton =
  /*#__PURE__*/ createStandaloneLPMButton(
    "boletobancario",
    "BoletobancarioPaymentButton",
  );
export const PaysafecardPaymentButton = /*#__PURE__*/ createStandaloneLPMButton(
  "paysafecard",
  "PaysafecardPaymentButton",
);
export const ScalapayPaymentButton = /*#__PURE__*/ createStandaloneLPMButton(
  "scalapay",
  "ScalapayPaymentButton",
);
export const CryptoPaymentButton = /*#__PURE__*/ createStandaloneLPMButton(
  "crypto",
  "CryptoPaymentButton",
);
export const DragonpayPaymentButton = /*#__PURE__*/ createStandaloneLPMButton(
  "dragonpay",
  "DragonpayPaymentButton",
);
export const FpxPaymentButton = /*#__PURE__*/ createStandaloneLPMButton(
  "fpx",
  "FpxPaymentButton",
);
export const IndomaretPaymentButton = /*#__PURE__*/ createStandaloneLPMButton(
  "indomaret",
  "IndomaretPaymentButton",
);
export const ThailandBanksPaymentButton =
  /*#__PURE__*/ createStandaloneLPMButton(
    "thailandBanks",
    "ThailandBanksPaymentButton",
  );
export const AlfamartPaymentButton = /*#__PURE__*/ createStandaloneLPMButton(
  "alfamart",
  "AlfamartPaymentButton",
);
export const ZipPaymentButton = /*#__PURE__*/ createStandaloneLPMButton(
  "zip",
  "ZipPaymentButton",
);
export const LatviaBanksPaymentButton = /*#__PURE__*/ createStandaloneLPMButton(
  "latviaBanks",
  "LatviaBanksPaymentButton",
);
export const FiuuPaymentButton = /*#__PURE__*/ createStandaloneLPMButton(
  "fiuu",
  "FiuuPaymentButton",
);
export const LithuaniaBanksPaymentButton =
  /*#__PURE__*/ createStandaloneLPMButton(
    "lithuaniaBanks",
    "LithuaniaBanksPaymentButton",
  );
