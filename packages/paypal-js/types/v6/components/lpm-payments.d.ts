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

/** Merchant-provided session-level inputs required by specific LPMs. */
export type LPMSessionFieldPhone = {
  countryCode: string;
  nationalNumber: string;
};

export type LPMSessionFieldBillingAddress = {
  addressLine1: string;
  addressLine2?: string;
  adminArea1: string;
  adminArea2?: string;
  postalCode: string;
  countryCode: string;
};

export type LPMSessionFieldTaxInfo = {
  taxId: string;
  taxIdType: string;
};

/**
 * Optional session-level inputs collected by the merchant and forwarded to the
 * SDK when starting an LPM payment session. Only a subset of fields is required
 * per LPM (see `LPMConfig.sessionFields` in the registry).
 */
export type LPMSessionFields = {
  phone?: LPMSessionFieldPhone;
  billingAddress?: LPMSessionFieldBillingAddress;
  taxInfo?: LPMSessionFieldTaxInfo;
  expiryDate?: string;
  dateOfBirth?: string;
  numberOfInstallments?: number;
};

/**
 * Options passed to `LPMOneTimePaymentSession.start()`.
 * Extends the presentation-mode options with optional merchant-collected
 * session fields (phone, billingAddress, taxInfo, etc.) required by some LPMs.
 */
export type LPMStartOptions = LPMPresentationModeOptions & LPMSessionFields;

export type LPMOneTimePaymentSessionPromise = Promise<{
  orderId: string;
  phone?: LPMSessionFieldPhone;
  billingAddress?: LPMSessionFieldBillingAddress;
  taxInfo?: LPMSessionFieldTaxInfo;
  expiryDate?: string;
}>;

export type LPMOneTimePaymentSession = Omit<BasePaymentSession, "start"> & {
  start: (
    options: LPMStartOptions,
    paymentSessionPromise?: LPMOneTimePaymentSessionPromise,
  ) => Promise<void>;
  createPaymentFields: (options: { type: "email" | "name" | "tax_id" | "tax_id_type"; style?: Record<string, unknown>; value?: string }) => HTMLElement;
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
  | "thailand-banks-payments"
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

/**
 * The {@link LPMPaymentsInstance} provides access to Local Payment Method (LPM)
 * session creation methods, enabling integration with a wide range of regional
 * payment methods (e.g. iDEAL, Bancontact, BLIK, Pix). Each method corresponds
 * to a specific LPM component passed to `createInstance`.
 */
export type LPMPaymentsInstance = {
  [K in LPMSessionMethodName]?: (
    options: LPMOneTimePaymentSessionOptions,
  ) => LPMOneTimePaymentSession;
};
