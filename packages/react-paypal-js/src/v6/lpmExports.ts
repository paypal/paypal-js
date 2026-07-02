import React from "react";

import {
  LPMOneTimePaymentButton,
  type LPMOneTimePaymentButtonProps,
} from "./components/LPMOneTimePaymentButton";
import { LPM_REGISTRY } from "./config/lpmRegistry";
import {
  createLPMButtonComponent,
  createEnhancedLPMHook,
  type LPMSessionHandle,
  type LPMButtonComponentProps,
  type LPMFieldComponentProps,
  type LPMEnhancedHookReturn,
} from "./components/LPMPaymentProvider";

import type { UseLPMOneTimePaymentSessionProps } from "./hooks/useLPMOneTimePaymentSession";
import type { LPMName } from "./config/lpmRegistry";

export type { LPMSessionHandle, LPMButtonComponentProps, LPMFieldComponentProps, LPMEnhancedHookReturn };

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

function createLPMHook(lpm: LPMName) {
  return createEnhancedLPMHook(lpm, LPM_REGISTRY[lpm].fields);
}

// Named Button Components
export const IdealOneTimePaymentButton = createLPMButton("ideal");
export const BancontactOneTimePaymentButton = createLPMButton("bancontact");
export const EpsOneTimePaymentButton = createLPMButton("eps");
export const BlikOneTimePaymentButton = createLPMButton("blik");
export const MybankOneTimePaymentButton = createLPMButton("mybank");
export const TrustlyOneTimePaymentButton = createLPMButton("trustly");
export const P24OneTimePaymentButton = createLPMButton("p24");
export const MultibancoOneTimePaymentButton = createLPMButton("multibanco");
export const BizumOneTimePaymentButton = createLPMButton("bizum");
export const SwishOneTimePaymentButton = createLPMButton("swish");
export const TwintOneTimePaymentButton = createLPMButton("twint");
export const WechatpayOneTimePaymentButton = createLPMButton("wechatpay");
export const VerkkopankkiOneTimePaymentButton = createLPMButton("verkkopankki");
export const PayuOneTimePaymentButton = createLPMButton("payu");
export const MbwayOneTimePaymentButton = createLPMButton("mbway");
export const SatispayOneTimePaymentButton = createLPMButton("satispay");
export const WeroOneTimePaymentButton = createLPMButton("wero");
export const FloaOneTimePaymentButton = createLPMButton("floa");
export const GrabpayOneTimePaymentButton = createLPMButton("grabpay");
export const PixInternationalOneTimePaymentButton = createLPMButton("pixInternational");
export const SepaOneTimePaymentButton = createLPMButton("sepa");
export const DokuOneTimePaymentButton = createLPMButton("doku");
export const EstoniaOneTimePaymentButton = createLPMButton("estonia");
export const GopayOneTimePaymentButton = createLPMButton("gopay");
export const AlipayOneTimePaymentButton = createLPMButton("alipay");
export const IndonesiaBanksOneTimePaymentButton = createLPMButton("indonesiaBanks");
export const KredivoOneTimePaymentButton = createLPMButton("kredivo");
export const LinkajaOneTimePaymentButton = createLPMButton("linkaja");
export const OvoOneTimePaymentButton = createLPMButton("ovo");
export const PayseraOneTimePaymentButton = createLPMButton("paysera");
export const SkrillOneTimePaymentButton = createLPMButton("skrill");
export const BlikPayLaterOneTimePaymentButton = createLPMButton("blikPayLater");
export const BancomatPayOneTimePaymentButton = createLPMButton("bancomatPay");
export const JeniuspayOneTimePaymentButton = createLPMButton("jeniuspay");

// Button prop type aliases
export type IdealOneTimePaymentButtonProps = NamedLPMButtonProps;
export type BancontactOneTimePaymentButtonProps = NamedLPMButtonProps;
export type EpsOneTimePaymentButtonProps = NamedLPMButtonProps;
export type BlikOneTimePaymentButtonProps = NamedLPMButtonProps;

// Named Hooks
export const useIdealOneTimePaymentSession = createLPMHook("ideal");
export const useBancontactOneTimePaymentSession = createLPMHook("bancontact");
export const useEpsOneTimePaymentSession = createLPMHook("eps");
export const useBlikOneTimePaymentSession = createLPMHook("blik");
export const useMybankOneTimePaymentSession = createLPMHook("mybank");
export const useTrustlyOneTimePaymentSession = createLPMHook("trustly");
export const useP24OneTimePaymentSession = createLPMHook("p24");
export const useMultibancoOneTimePaymentSession = createLPMHook("multibanco");
export const useBizumOneTimePaymentSession = createLPMHook("bizum");
export const useSwishOneTimePaymentSession = createLPMHook("swish");
export const useTwintOneTimePaymentSession = createLPMHook("twint");
export const useWechatpayOneTimePaymentSession = createLPMHook("wechatpay");
export const useVerkkopankkiOneTimePaymentSession = createLPMHook("verkkopankki");
export const usePayuOneTimePaymentSession = createLPMHook("payu");
export const useMbwayOneTimePaymentSession = createLPMHook("mbway");
export const useSatispayOneTimePaymentSession = createLPMHook("satispay");
export const useWeroOneTimePaymentSession = createLPMHook("wero");
export const useFloaOneTimePaymentSession = createLPMHook("floa");
export const useGrabpayOneTimePaymentSession = createLPMHook("grabpay");
export const usePixInternationalOneTimePaymentSession = createLPMHook("pixInternational");
export const useSepaOneTimePaymentSession = createLPMHook("sepa");
export const useDokuOneTimePaymentSession = createLPMHook("doku");
export const useEstoniaOneTimePaymentSession = createLPMHook("estonia");
export const useGopayOneTimePaymentSession = createLPMHook("gopay");
export const useAlipayOneTimePaymentSession = createLPMHook("alipay");
export const useIndonesiaBanksOneTimePaymentSession = createLPMHook("indonesiaBanks");
export const useKredivoOneTimePaymentSession = createLPMHook("kredivo");
export const useLinkajaOneTimePaymentSession = createLPMHook("linkaja");
export const useOvoOneTimePaymentSession = createLPMHook("ovo");
export const usePayseraOneTimePaymentSession = createLPMHook("paysera");
export const useSkrillOneTimePaymentSession = createLPMHook("skrill");
export const useBlikPayLaterOneTimePaymentSession = createLPMHook("blikPayLater");
export const useBancomatPayOneTimePaymentSession = createLPMHook("bancomatPay");
export const useJeniuspayOneTimePaymentSession = createLPMHook("jeniuspay");

// Generic LPM exports — also accessible from this subpath so the subpath is
// fully self-contained and consumers never need to import from ./sdk-v6 for LPMs.
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

// ─── Named standalone button components ───────────────────────────────────────
// Accept a `paymentSession` prop (return value of the corresponding named hook).
// Can be placed anywhere in the layout — no Provider wrapping required.
export const IdealPaymentButton = createLPMButtonComponent(LPM_REGISTRY.ideal.buttonTag, "IdealPaymentButton");
export const BancontactPaymentButton = createLPMButtonComponent(LPM_REGISTRY.bancontact.buttonTag, "BancontactPaymentButton");
export const EpsPaymentButton = createLPMButtonComponent(LPM_REGISTRY.eps.buttonTag, "EpsPaymentButton");
export const BlikPaymentButton = createLPMButtonComponent(LPM_REGISTRY.blik.buttonTag, "BlikPaymentButton");
export const MybankPaymentButton = createLPMButtonComponent(LPM_REGISTRY.mybank.buttonTag, "MybankPaymentButton");
export const TrustlyPaymentButton = createLPMButtonComponent(LPM_REGISTRY.trustly.buttonTag, "TrustlyPaymentButton");
export const P24PaymentButton = createLPMButtonComponent(LPM_REGISTRY.p24.buttonTag, "P24PaymentButton");
export const MultibancoPaymentButton = createLPMButtonComponent(LPM_REGISTRY.multibanco.buttonTag, "MultibancoPaymentButton");
export const BizumPaymentButton = createLPMButtonComponent(LPM_REGISTRY.bizum.buttonTag, "BizumPaymentButton");
export const SwishPaymentButton = createLPMButtonComponent(LPM_REGISTRY.swish.buttonTag, "SwishPaymentButton");
export const TwintPaymentButton = createLPMButtonComponent(LPM_REGISTRY.twint.buttonTag, "TwintPaymentButton");
export const WechatpayPaymentButton = createLPMButtonComponent(LPM_REGISTRY.wechatpay.buttonTag, "WechatpayPaymentButton");
export const VerkkopankkiPaymentButton = createLPMButtonComponent(LPM_REGISTRY.verkkopankki.buttonTag, "VerkkopankkiPaymentButton");
export const PayuPaymentButton = createLPMButtonComponent(LPM_REGISTRY.payu.buttonTag, "PayuPaymentButton");
export const MbwayPaymentButton = createLPMButtonComponent(LPM_REGISTRY.mbway.buttonTag, "MbwayPaymentButton");
export const SatispayPaymentButton = createLPMButtonComponent(LPM_REGISTRY.satispay.buttonTag, "SatispayPaymentButton");
export const WeroPaymentButton = createLPMButtonComponent(LPM_REGISTRY.wero.buttonTag, "WeroPaymentButton");
export const FloaPaymentButton = createLPMButtonComponent(LPM_REGISTRY.floa.buttonTag, "FloaPaymentButton");
export const GrabpayPaymentButton = createLPMButtonComponent(LPM_REGISTRY.grabpay.buttonTag, "GrabpayPaymentButton");
export const PixInternationalPaymentButton = createLPMButtonComponent(LPM_REGISTRY.pixInternational.buttonTag, "PixInternationalPaymentButton");
export const SepaPaymentButton = createLPMButtonComponent(LPM_REGISTRY.sepa.buttonTag, "SepaPaymentButton");
export const DokuPaymentButton = createLPMButtonComponent(LPM_REGISTRY.doku.buttonTag, "DokuPaymentButton");
export const EstoniaPaymentButton = createLPMButtonComponent(LPM_REGISTRY.estonia.buttonTag, "EstoniaPaymentButton");
export const GopayPaymentButton = createLPMButtonComponent(LPM_REGISTRY.gopay.buttonTag, "GopayPaymentButton");
export const AlipayPaymentButton = createLPMButtonComponent(LPM_REGISTRY.alipay.buttonTag, "AlipayPaymentButton");
export const IndonesiaBanksPaymentButton = createLPMButtonComponent(LPM_REGISTRY.indonesiaBanks.buttonTag, "IndonesiaBanksPaymentButton");
export const KredivoPaymentButton = createLPMButtonComponent(LPM_REGISTRY.kredivo.buttonTag, "KredivoPaymentButton");
export const LinkajaPaymentButton = createLPMButtonComponent(LPM_REGISTRY.linkaja.buttonTag, "LinkajaPaymentButton");
export const OvoPaymentButton = createLPMButtonComponent(LPM_REGISTRY.ovo.buttonTag, "OvoPaymentButton");
export const PayseraPaymentButton = createLPMButtonComponent(LPM_REGISTRY.paysera.buttonTag, "PayseraPaymentButton");
export const SkrillPaymentButton = createLPMButtonComponent(LPM_REGISTRY.skrill.buttonTag, "SkrillPaymentButton");
export const BlikPayLaterPaymentButton = createLPMButtonComponent(LPM_REGISTRY.blikPayLater.buttonTag, "BlikPayLaterPaymentButton");
export const BancomatPayPaymentButton = createLPMButtonComponent(LPM_REGISTRY.bancomatPay.buttonTag, "BancomatPayPaymentButton");
export const JeniuspayPaymentButton = createLPMButtonComponent(LPM_REGISTRY.jeniuspay.buttonTag, "JeniuspayPaymentButton");
