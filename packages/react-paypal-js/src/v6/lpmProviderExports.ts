/**
 * Standalone named payment button components.
 *
 * Each button accepts a `paymentSession` prop — pass the return value of the
 * corresponding `use*OneTimePaymentSession` hook directly. No Provider or
 * subtree restriction: the button can live anywhere in your component tree.
 *
 * The field components for the same LPM are returned by the hook itself
 * (e.g. `NameField`, `EmailField`), so there is no need to import them here.
 *
 * @example
 * import { useIdealOneTimePaymentSession, IdealPaymentButton } from "@paypal/react-paypal-js";
 *
 * function CheckoutPage() {
 *   const idealSession = useIdealOneTimePaymentSession({
 *     createOrder: async () => ({ orderId: await createOrderOnServer() }),
 *     onApprove:   async ({ orderId }) => { await capture(orderId); },
 *     presentationMode: "popup",
 *   });
 *
 *   const { NameField } = idealSession;
 *
 *   return (
 *     <>
 *       <BillingSection>
 *         <input name="email" />        // merchant's own field
 *         <NameField />                 // iDEAL name field — from the hook
 *       </BillingSection>
 *
 *       <CheckoutFooter>
 *         <IdealPaymentButton paymentSession={idealSession} type="pay" />
 *       </CheckoutFooter>
 *     </>
 *   );
 * }
 */

import { createLPMButtonComponent } from "./components/LPMPaymentProvider";
import { LPM_REGISTRY } from "./config/lpmRegistry";

export const IdealPaymentButton =
  createLPMButtonComponent(LPM_REGISTRY.ideal.buttonTag, "IdealPaymentButton");

export const BancontactPaymentButton =
  createLPMButtonComponent(LPM_REGISTRY.bancontact.buttonTag, "BancontactPaymentButton");

export const EpsPaymentButton =
  createLPMButtonComponent(LPM_REGISTRY.eps.buttonTag, "EpsPaymentButton");

export const BlikPaymentButton =
  createLPMButtonComponent(LPM_REGISTRY.blik.buttonTag, "BlikPaymentButton");

export const MybankPaymentButton =
  createLPMButtonComponent(LPM_REGISTRY.mybank.buttonTag, "MybankPaymentButton");

export const TrustlyPaymentButton =
  createLPMButtonComponent(LPM_REGISTRY.trustly.buttonTag, "TrustlyPaymentButton");

export const P24PaymentButton =
  createLPMButtonComponent(LPM_REGISTRY.p24.buttonTag, "P24PaymentButton");

export const MultibancoPaymentButton =
  createLPMButtonComponent(LPM_REGISTRY.multibanco.buttonTag, "MultibancoPaymentButton");

export const BizumPaymentButton =
  createLPMButtonComponent(LPM_REGISTRY.bizum.buttonTag, "BizumPaymentButton");

export const SwishPaymentButton =
  createLPMButtonComponent(LPM_REGISTRY.swish.buttonTag, "SwishPaymentButton");

export const TwintPaymentButton =
  createLPMButtonComponent(LPM_REGISTRY.twint.buttonTag, "TwintPaymentButton");

export const WechatpayPaymentButton =
  createLPMButtonComponent(LPM_REGISTRY.wechatpay.buttonTag, "WechatpayPaymentButton");

export const VerkkopankkiPaymentButton =
  createLPMButtonComponent(LPM_REGISTRY.verkkopankki.buttonTag, "VerkkopankkiPaymentButton");

export const PayuPaymentButton =
  createLPMButtonComponent(LPM_REGISTRY.payu.buttonTag, "PayuPaymentButton");

export const MbwayPaymentButton =
  createLPMButtonComponent(LPM_REGISTRY.mbway.buttonTag, "MbwayPaymentButton");

export const SatispayPaymentButton =
  createLPMButtonComponent(LPM_REGISTRY.satispay.buttonTag, "SatispayPaymentButton");

export const WeroPaymentButton =
  createLPMButtonComponent(LPM_REGISTRY.wero.buttonTag, "WeroPaymentButton");

export const FloaPaymentButton =
  createLPMButtonComponent(LPM_REGISTRY.floa.buttonTag, "FloaPaymentButton");

export const GrabpayPaymentButton =
  createLPMButtonComponent(LPM_REGISTRY.grabpay.buttonTag, "GrabpayPaymentButton");

export const PixInternationalPaymentButton =
  createLPMButtonComponent(LPM_REGISTRY.pixInternational.buttonTag, "PixInternationalPaymentButton");

export const SepaPaymentButton =
  createLPMButtonComponent(LPM_REGISTRY.sepa.buttonTag, "SepaPaymentButton");

export const DokuPaymentButton =
  createLPMButtonComponent(LPM_REGISTRY.doku.buttonTag, "DokuPaymentButton");

export const EstoniaPaymentButton =
  createLPMButtonComponent(LPM_REGISTRY.estonia.buttonTag, "EstoniaPaymentButton");

export const GopayPaymentButton =
  createLPMButtonComponent(LPM_REGISTRY.gopay.buttonTag, "GopayPaymentButton");

export const AlipayPaymentButton =
  createLPMButtonComponent(LPM_REGISTRY.alipay.buttonTag, "AlipayPaymentButton");

export const IndonesiaBanksPaymentButton =
  createLPMButtonComponent(LPM_REGISTRY.indonesiaBanks.buttonTag, "IndonesiaBanksPaymentButton");

export const KredivoPaymentButton =
  createLPMButtonComponent(LPM_REGISTRY.kredivo.buttonTag, "KredivoPaymentButton");

export const LinkajaPaymentButton =
  createLPMButtonComponent(LPM_REGISTRY.linkaja.buttonTag, "LinkajaPaymentButton");

export const OvoPaymentButton =
  createLPMButtonComponent(LPM_REGISTRY.ovo.buttonTag, "OvoPaymentButton");

export const PayseraPaymentButton =
  createLPMButtonComponent(LPM_REGISTRY.paysera.buttonTag, "PayseraPaymentButton");

export const SkrillPaymentButton =
  createLPMButtonComponent(LPM_REGISTRY.skrill.buttonTag, "SkrillPaymentButton");

export const BlikPayLaterPaymentButton =
  createLPMButtonComponent(LPM_REGISTRY.blikPayLater.buttonTag, "BlikPayLaterPaymentButton");

export const BancomatPayPaymentButton =
  createLPMButtonComponent(LPM_REGISTRY.bancomatPay.buttonTag, "BancomatPayPaymentButton");

export const JeniuspayPaymentButton =
  createLPMButtonComponent(LPM_REGISTRY.jeniuspay.buttonTag, "JeniuspayPaymentButton");
