import React from "react";

import {
  LPMOneTimePaymentButton,
  type LPMOneTimePaymentButtonProps,
} from "./components/LPMOneTimePaymentButton";
import { useLPMOneTimePaymentSession } from "./hooks/useLPMOneTimePaymentSession";
import { LPM_REGISTRY } from "./config/lpmRegistry";

import type { UseLPMOneTimePaymentSessionProps } from "./hooks/useLPMOneTimePaymentSession";
import type { LPMName } from "./config/lpmRegistry";

type NamedLPMButtonProps = Omit<LPMOneTimePaymentButtonProps, "lpm">;
type NamedLPMHookProps = Omit<UseLPMOneTimePaymentSessionProps, "lpm">;

// ─── Standalone button infrastructure ────────────────────────────────────────

/** Minimal subset of a payment session needed by a standalone LPM button. */
export interface LPMSessionHandle {
  handleClick: () => Promise<{ redirectURL?: string } | void>;
  isPending: boolean;
  error: Error | null;
}

export interface LPMButtonComponentProps {
  paymentSession: LPMSessionHandle;
  type?: string;
  disabled?: boolean;
  [key: string]: unknown;
}

function createLPMButtonComponent(buttonTag: string, displayName: string) {
  function ButtonComponent({
    paymentSession,
    type = "pay",
    disabled,
    ...rest
  }: LPMButtonComponentProps) {
    const { handleClick, isPending, error } = paymentSession;
    return React.createElement(buttonTag, {
      ...rest,
      onClick: handleClick,
      type,
      disabled: disabled || isPending || error !== null ? true : undefined,
    });
  }
  ButtonComponent.displayName = displayName;
  return ButtonComponent;
}

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
  return (props: NamedLPMHookProps) =>
    useLPMOneTimePaymentSession({
      lpm,
      ...props,
    } as UseLPMOneTimePaymentSessionProps);
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
export const KlarnaOneTimePaymentButton = createLPMButton("klarna");
export const TwintOneTimePaymentButton = createLPMButton("twint");
export const WechatpayOneTimePaymentButton = createLPMButton("wechatpay");
export const AfterpayOneTimePaymentButton = createLPMButton("afterpay");
export const OxxopayOneTimePaymentButton = createLPMButton("oxxopay");
export const BoletobancarioOneTimePaymentButton = createLPMButton("boletobancario");
export const VerkkopankkiOneTimePaymentButton = createLPMButton("verkkopankki");
export const PayuOneTimePaymentButton = createLPMButton("payu");
export const PaysafecardOneTimePaymentButton = createLPMButton("paysafecard");
export const MbwayOneTimePaymentButton = createLPMButton("mbway");
export const SatispayOneTimePaymentButton = createLPMButton("satispay");
export const WeroOneTimePaymentButton = createLPMButton("wero");
export const FloaOneTimePaymentButton = createLPMButton("floa");
export const ScalapayOneTimePaymentButton = createLPMButton("scalapay");
export const GrabpayOneTimePaymentButton = createLPMButton("grabpay");
export const PixInternationalOneTimePaymentButton = createLPMButton("pixInternational");
export const SepaOneTimePaymentButton = createLPMButton("sepa");
export const CryptoOneTimePaymentButton = createLPMButton("crypto");
export const DokuOneTimePaymentButton = createLPMButton("doku");
export const DragonpayOneTimePaymentButton = createLPMButton("dragonpay");
export const EstoniaOneTimePaymentButton = createLPMButton("estonia");
export const FpxOneTimePaymentButton = createLPMButton("fpx");
export const GopayOneTimePaymentButton = createLPMButton("gopay");
export const AlipayOneTimePaymentButton = createLPMButton("alipay");
export const IndomaretOneTimePaymentButton = createLPMButton("indomaret");
export const IndonesiaBanksOneTimePaymentButton = createLPMButton("indonesiaBanks");
export const KredivoOneTimePaymentButton = createLPMButton("kredivo");
export const LinkajaOneTimePaymentButton = createLPMButton("linkaja");
export const OvoOneTimePaymentButton = createLPMButton("ovo");
export const PayseraOneTimePaymentButton = createLPMButton("paysera");
export const SkrillOneTimePaymentButton = createLPMButton("skrill");
export const ThailandBanksOneTimePaymentButton = createLPMButton("thailandBanks");
export const BlikPayLaterOneTimePaymentButton = createLPMButton("blikPayLater");
export const AlfamartOneTimePaymentButton = createLPMButton("alfamart");
export const ZipOneTimePaymentButton = createLPMButton("zip");
export const BancomatPayOneTimePaymentButton = createLPMButton("bancomatPay");
export const LatviaBanksOneTimePaymentButton = createLPMButton("latviaBanks");
export const FiuuOneTimePaymentButton = createLPMButton("fiuu");
export const LithuaniaBanksOneTimePaymentButton = createLPMButton("lithuaniaBanks");
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
export const useKlarnaOneTimePaymentSession = createLPMHook("klarna");
export const useTwintOneTimePaymentSession = createLPMHook("twint");
export const useWechatpayOneTimePaymentSession = createLPMHook("wechatpay");
export const useAfterpayOneTimePaymentSession = createLPMHook("afterpay");
export const useOxxopayOneTimePaymentSession = createLPMHook("oxxopay");
export const useBoletobancarioOneTimePaymentSession = createLPMHook("boletobancario");
export const useVerkkopankkiOneTimePaymentSession = createLPMHook("verkkopankki");
export const usePayuOneTimePaymentSession = createLPMHook("payu");
export const usePaysafecardOneTimePaymentSession = createLPMHook("paysafecard");
export const useMbwayOneTimePaymentSession = createLPMHook("mbway");
export const useSatispayOneTimePaymentSession = createLPMHook("satispay");
export const useWeroOneTimePaymentSession = createLPMHook("wero");
export const useFloaOneTimePaymentSession = createLPMHook("floa");
export const useScalapayOneTimePaymentSession = createLPMHook("scalapay");
export const useGrabpayOneTimePaymentSession = createLPMHook("grabpay");
export const usePixInternationalOneTimePaymentSession = createLPMHook("pixInternational");
export const useSepaOneTimePaymentSession = createLPMHook("sepa");
export const useCryptoOneTimePaymentSession = createLPMHook("crypto");
export const useDokuOneTimePaymentSession = createLPMHook("doku");
export const useDragonpayOneTimePaymentSession = createLPMHook("dragonpay");
export const useEstoniaOneTimePaymentSession = createLPMHook("estonia");
export const useFpxOneTimePaymentSession = createLPMHook("fpx");
export const useGopayOneTimePaymentSession = createLPMHook("gopay");
export const useAlipayOneTimePaymentSession = createLPMHook("alipay");
export const useIndomaretOneTimePaymentSession = createLPMHook("indomaret");
export const useIndonesiaBanksOneTimePaymentSession = createLPMHook("indonesiaBanks");
export const useKredivoOneTimePaymentSession = createLPMHook("kredivo");
export const useLinkajaOneTimePaymentSession = createLPMHook("linkaja");
export const useOvoOneTimePaymentSession = createLPMHook("ovo");
export const usePayseraOneTimePaymentSession = createLPMHook("paysera");
export const useSkrillOneTimePaymentSession = createLPMHook("skrill");
export const useThailandBanksOneTimePaymentSession = createLPMHook("thailandBanks");
export const useBlikPayLaterOneTimePaymentSession = createLPMHook("blikPayLater");
export const useAlfamartOneTimePaymentSession = createLPMHook("alfamart");
export const useZipOneTimePaymentSession = createLPMHook("zip");
export const useBancomatPayOneTimePaymentSession = createLPMHook("bancomatPay");
export const useLatviaBanksOneTimePaymentSession = createLPMHook("latviaBanks");
export const useFiuuOneTimePaymentSession = createLPMHook("fiuu");
export const useLithuaniaBanksOneTimePaymentSession = createLPMHook("lithuaniaBanks");
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
export type UseKlarnaOneTimePaymentSessionProps = NamedLPMHookProps;
export type UseTwintOneTimePaymentSessionProps = NamedLPMHookProps;
export type UseWechatpayOneTimePaymentSessionProps = NamedLPMHookProps;
export type UseAfterpayOneTimePaymentSessionProps = NamedLPMHookProps;
export type UseOxxopayOneTimePaymentSessionProps = NamedLPMHookProps;
export type UseBoletobancarioOneTimePaymentSessionProps = NamedLPMHookProps;
export type UseVerkkopankkiOneTimePaymentSessionProps = NamedLPMHookProps;
export type UsePayuOneTimePaymentSessionProps = NamedLPMHookProps;
export type UsePaysafecardOneTimePaymentSessionProps = NamedLPMHookProps;
export type UseMbwayOneTimePaymentSessionProps = NamedLPMHookProps;
export type UseSatispayOneTimePaymentSessionProps = NamedLPMHookProps;
export type UseWeroOneTimePaymentSessionProps = NamedLPMHookProps;
export type UseFloaOneTimePaymentSessionProps = NamedLPMHookProps;
export type UseScalapayOneTimePaymentSessionProps = NamedLPMHookProps;
export type UseGrabpayOneTimePaymentSessionProps = NamedLPMHookProps;
export type UsePixInternationalOneTimePaymentSessionProps = NamedLPMHookProps;
export type UseSepaOneTimePaymentSessionProps = NamedLPMHookProps;
export type UseCryptoOneTimePaymentSessionProps = NamedLPMHookProps;
export type UseDokuOneTimePaymentSessionProps = NamedLPMHookProps;
export type UseDragonpayOneTimePaymentSessionProps = NamedLPMHookProps;
export type UseEstoniaOneTimePaymentSessionProps = NamedLPMHookProps;
export type UseFpxOneTimePaymentSessionProps = NamedLPMHookProps;
export type UseGopayOneTimePaymentSessionProps = NamedLPMHookProps;
export type UseAlipayOneTimePaymentSessionProps = NamedLPMHookProps;
export type UseIndomaretOneTimePaymentSessionProps = NamedLPMHookProps;
export type UseIndonesiaBanksOneTimePaymentSessionProps = NamedLPMHookProps;
export type UseKredivoOneTimePaymentSessionProps = NamedLPMHookProps;
export type UseLinkajaOneTimePaymentSessionProps = NamedLPMHookProps;
export type UseOvoOneTimePaymentSessionProps = NamedLPMHookProps;
export type UsePayseraOneTimePaymentSessionProps = NamedLPMHookProps;
export type UseSkrillOneTimePaymentSessionProps = NamedLPMHookProps;
export type UseThailandBanksOneTimePaymentSessionProps = NamedLPMHookProps;
export type UseBlikPayLaterOneTimePaymentSessionProps = NamedLPMHookProps;
export type UseAlfamartOneTimePaymentSessionProps = NamedLPMHookProps;
export type UseZipOneTimePaymentSessionProps = NamedLPMHookProps;
export type UseBancomatPayOneTimePaymentSessionProps = NamedLPMHookProps;
export type UseLatviaBanksOneTimePaymentSessionProps = NamedLPMHookProps;
export type UseFiuuOneTimePaymentSessionProps = NamedLPMHookProps;
export type UseLithuaniaBanksOneTimePaymentSessionProps = NamedLPMHookProps;
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
export const KlarnaPaymentButton = createLPMButtonComponent(LPM_REGISTRY.klarna.buttonTag, "KlarnaPaymentButton");
export const TwintPaymentButton = createLPMButtonComponent(LPM_REGISTRY.twint.buttonTag, "TwintPaymentButton");
export const WechatpayPaymentButton = createLPMButtonComponent(LPM_REGISTRY.wechatpay.buttonTag, "WechatpayPaymentButton");
export const AfterpayPaymentButton = createLPMButtonComponent(LPM_REGISTRY.afterpay.buttonTag, "AfterpayPaymentButton");
export const OxxopayPaymentButton = createLPMButtonComponent(LPM_REGISTRY.oxxopay.buttonTag, "OxxopayPaymentButton");
export const BoletobancarioPaymentButton = createLPMButtonComponent(LPM_REGISTRY.boletobancario.buttonTag, "BoletobancarioPaymentButton");
export const VerkkopankkiPaymentButton = createLPMButtonComponent(LPM_REGISTRY.verkkopankki.buttonTag, "VerkkopankkiPaymentButton");
export const PayuPaymentButton = createLPMButtonComponent(LPM_REGISTRY.payu.buttonTag, "PayuPaymentButton");
export const PaysafecardPaymentButton = createLPMButtonComponent(LPM_REGISTRY.paysafecard.buttonTag, "PaysafecardPaymentButton");
export const MbwayPaymentButton = createLPMButtonComponent(LPM_REGISTRY.mbway.buttonTag, "MbwayPaymentButton");
export const SatispayPaymentButton = createLPMButtonComponent(LPM_REGISTRY.satispay.buttonTag, "SatispayPaymentButton");
export const WeroPaymentButton = createLPMButtonComponent(LPM_REGISTRY.wero.buttonTag, "WeroPaymentButton");
export const FloaPaymentButton = createLPMButtonComponent(LPM_REGISTRY.floa.buttonTag, "FloaPaymentButton");
export const ScalapayPaymentButton = createLPMButtonComponent(LPM_REGISTRY.scalapay.buttonTag, "ScalapayPaymentButton");
export const GrabpayPaymentButton = createLPMButtonComponent(LPM_REGISTRY.grabpay.buttonTag, "GrabpayPaymentButton");
export const PixInternationalPaymentButton = createLPMButtonComponent(LPM_REGISTRY.pixInternational.buttonTag, "PixInternationalPaymentButton");
export const SepaPaymentButton = createLPMButtonComponent(LPM_REGISTRY.sepa.buttonTag, "SepaPaymentButton");
export const CryptoPaymentButton = createLPMButtonComponent(LPM_REGISTRY.crypto.buttonTag, "CryptoPaymentButton");
export const DokuPaymentButton = createLPMButtonComponent(LPM_REGISTRY.doku.buttonTag, "DokuPaymentButton");
export const DragonpayPaymentButton = createLPMButtonComponent(LPM_REGISTRY.dragonpay.buttonTag, "DragonpayPaymentButton");
export const EstoniaPaymentButton = createLPMButtonComponent(LPM_REGISTRY.estonia.buttonTag, "EstoniaPaymentButton");
export const FpxPaymentButton = createLPMButtonComponent(LPM_REGISTRY.fpx.buttonTag, "FpxPaymentButton");
export const GopayPaymentButton = createLPMButtonComponent(LPM_REGISTRY.gopay.buttonTag, "GopayPaymentButton");
export const AlipayPaymentButton = createLPMButtonComponent(LPM_REGISTRY.alipay.buttonTag, "AlipayPaymentButton");
export const IndomaretPaymentButton = createLPMButtonComponent(LPM_REGISTRY.indomaret.buttonTag, "IndomaretPaymentButton");
export const IndonesiaBanksPaymentButton = createLPMButtonComponent(LPM_REGISTRY.indonesiaBanks.buttonTag, "IndonesiaBanksPaymentButton");
export const KredivoPaymentButton = createLPMButtonComponent(LPM_REGISTRY.kredivo.buttonTag, "KredivoPaymentButton");
export const LinkajaPaymentButton = createLPMButtonComponent(LPM_REGISTRY.linkaja.buttonTag, "LinkajaPaymentButton");
export const OvoPaymentButton = createLPMButtonComponent(LPM_REGISTRY.ovo.buttonTag, "OvoPaymentButton");
export const PayseraPaymentButton = createLPMButtonComponent(LPM_REGISTRY.paysera.buttonTag, "PayseraPaymentButton");
export const SkrillPaymentButton = createLPMButtonComponent(LPM_REGISTRY.skrill.buttonTag, "SkrillPaymentButton");
export const ThailandBanksPaymentButton = createLPMButtonComponent(LPM_REGISTRY.thailandBanks.buttonTag, "ThailandBanksPaymentButton");
export const BlikPayLaterPaymentButton = createLPMButtonComponent(LPM_REGISTRY.blikPayLater.buttonTag, "BlikPayLaterPaymentButton");
export const AlfamartPaymentButton = createLPMButtonComponent(LPM_REGISTRY.alfamart.buttonTag, "AlfamartPaymentButton");
export const ZipPaymentButton = createLPMButtonComponent(LPM_REGISTRY.zip.buttonTag, "ZipPaymentButton");
export const BancomatPayPaymentButton = createLPMButtonComponent(LPM_REGISTRY.bancomatPay.buttonTag, "BancomatPayPaymentButton");
export const LatviaBanksPaymentButton = createLPMButtonComponent(LPM_REGISTRY.latviaBanks.buttonTag, "LatviaBanksPaymentButton");
export const FiuuPaymentButton = createLPMButtonComponent(LPM_REGISTRY.fiuu.buttonTag, "FiuuPaymentButton");
export const LithuaniaBanksPaymentButton = createLPMButtonComponent(LPM_REGISTRY.lithuaniaBanks.buttonTag, "LithuaniaBanksPaymentButton");
export const JeniuspayPaymentButton = createLPMButtonComponent(LPM_REGISTRY.jeniuspay.buttonTag, "JeniuspayPaymentButton");
