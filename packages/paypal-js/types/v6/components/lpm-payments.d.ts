import {
  BasePaymentSessionOptions,
  BasePaymentSession,
  PresentationModeOptionsForPopup,
  PresentationModeOptionsForAuto,
} from "./base-component";

export type LPMOneTimePaymentSessionOptions = BasePaymentSessionOptions & {
  orderId?: string;
};

export type LPMPresentationModeOptions =
  | PresentationModeOptionsForAuto
  | PresentationModeOptionsForPopup;

export type LPMOneTimePaymentSessionPromise = Promise<{
  orderId: string;
  phone?: { countryCode: string; nationalNumber: string };
  billingAddress?: {
    addressLine1: string;
    addressLine2?: string;
    adminArea1: string;
    adminArea2?: string;
    postalCode: string;
    countryCode: string;
  };
  taxInfo?: { taxId: string; taxIdType: string };
  expiryDate?: string;
}>;

export type LPMOneTimePaymentSession = Omit<BasePaymentSession, "start"> & {
  start: (
    presentationModeOptions: LPMPresentationModeOptions,
    paymentSessionPromise?: LPMOneTimePaymentSessionPromise,
  ) => Promise<void>;
  createPaymentFields: (options: { type: string; value?: string }) => HTMLElement;
  validate: () => Promise<boolean>;
};

export type LPMComponents =
  | "ideal-payments"
  | "bancontact-payments"
  | "eps-payments"
  | "blik-payments"
  | "mybank-payments"
  | "trustly-payments"
  | "p24-payments"
  | "multibanco-payments"
  | "bizum-payments"
  | "swish-payments"
  | "klarna-payments"
  | "twint-payments"
  | "wechatpay-payments"
  | "afterpay-payments"
  | "oxxopay-payments"
  | "boletobancario-payments"
  | "verkkopankki-payments"
  | "payu-payments"
  | "paysafecard-payments"
  | "mbway-payments"
  | "satispay-payments"
  | "wero-payments"
  | "floa-payments"
  | "scalapay-payments"
  | "grabpay-payments"
  | "pix-international-payments"
  | "sepa-payments"
  | "crypto-payments"
  | "doku-payments"
  | "dragonpay-payments"
  | "estoniabank-payments"
  | "fpx-payments"
  | "gopay-payments"
  | "alipay-payments"
  | "indomaret-payments"
  | "indonesiabanks-payments"
  | "kredivo-payments"
  | "linkaja-payments"
  | "ovo-payments"
  | "paysera-payments"
  | "skrill-payments"
  | "thailandbanks-payments"
  | "blikpaylater-payments"
  | "alfamart-payments"
  | "zip-payments"
  | "bancomatpay-payments"
  | "latviabanks-payments"
  | "fiuu-cash-payments"
  | "lithuaniabanks-payments"
  | "jeniuspay-payments";

export type LPMSessionMethodName =
  | "createIdealOneTimePaymentSession"
  | "createBancontactOneTimePaymentSession"
  | "createEpsOneTimePaymentSession"
  | "createBlikOneTimePaymentSession"
  | "createMyBankOneTimePaymentSession"
  | "createTrustlyOneTimePaymentSession"
  | "createP24OneTimePaymentSession"
  | "createMultibancoOneTimePaymentSession"
  | "createBizumOneTimePaymentSession"
  | "createSwishOneTimePaymentSession"
  | "createKlarnaOneTimePaymentSession"
  | "createTwintOneTimePaymentSession"
  | "createWechatpayOneTimePaymentSession"
  | "createAfterpayOneTimePaymentSession"
  | "createOxxopayOneTimePaymentSession"
  | "createBoletobancarioOneTimePaymentSession"
  | "createVerkkopankkiOneTimePaymentSession"
  | "createPayuOneTimePaymentSession"
  | "createPaysafecardOneTimePaymentSession"
  | "createMbWayOneTimePaymentSession"
  | "createSatispayOneTimePaymentSession"
  | "createWeroOneTimePaymentSession"
  | "createFloaOneTimePaymentSession"
  | "createScalapayOneTimePaymentSession"
  | "createGrabpayOneTimePaymentSession"
  | "createPixInternationalOneTimePaymentSession"
  | "createSepaOneTimePaymentSession"
  | "createCryptoOneTimePaymentSession"
  | "createDOKUOneTimePaymentSession"
  | "createDragonpayOneTimePaymentSession"
  | "createEstoniaOneTimePaymentSession"
  | "createFpxOneTimePaymentSession"
  | "createGopayOneTimePaymentSession"
  | "createAlipayOneTimePaymentSession"
  | "createIndomaretOneTimePaymentSession"
  | "createIndonesiaBanksOneTimePaymentSession"
  | "createKredivoOneTimePaymentSession"
  | "createLinkajaOneTimePaymentSession"
  | "createOvoOneTimePaymentSession"
  | "createPayseraOneTimePaymentSession"
  | "createSkrillOneTimePaymentSession"
  | "createThailandBanksOneTimePaymentSession"
  | "createBlikPayLaterOneTimePaymentSession"
  | "createAlfamartOneTimePaymentSession"
  | "createZipOneTimePaymentSession"
  | "createBancomatPayOneTimePaymentSession"
  | "createLatviaBanksOneTimePaymentSession"
  | "createFIUUOneTimePaymentSession"
  | "createLithuaniaBanksOneTimePaymentSession"
  | "createJeniuspayOneTimePaymentSession";

export type LPMPaymentsInstance = {
  [K in LPMSessionMethodName]?: (
    options: LPMOneTimePaymentSessionOptions,
  ) => LPMOneTimePaymentSession;
};
