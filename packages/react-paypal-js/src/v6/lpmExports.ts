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
