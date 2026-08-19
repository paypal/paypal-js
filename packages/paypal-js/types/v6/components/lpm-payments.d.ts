import {
  BasePaymentSessionOptions,
  BasePaymentSession,
  PresentationModeOptionsForPopup,
} from "./base-component";

export type LPMOneTimePaymentSessionOptions = BasePaymentSessionOptions & {
  orderId?: string;
};

export type LPMPresentationModeOptions = PresentationModeOptionsForPopup;

/** Merchant-provided session-level inputs required by specific LPMs. */
export type LPMSessionFieldPhone = {
  countryCode: string;
  nationalNumber: string;
};

export type LPMSessionFieldBillingAddress = {
  addressLine1: string;
  addressLine2: string;
  adminArea1: string;
  adminArea2: string;
  postalCode: string;
  countryCode: string;
};

export type LPMSessionFieldTaxInfo = {
  taxId: string;
  taxIdType: string;
};

export type LPMSessionFieldExpiryDate = {
  expiry_date: string;
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
  expiryDate?: LPMSessionFieldExpiryDate;
  dateOfBirth?: string;
  numberOfInstallments?: number;
};

/**
 * Options passed to `LPMOneTimePaymentSession.start()`.
 * Merchant-collected session fields (phone, billingAddress, taxInfo, etc.)
 * required by some LPMs are provided via the `paymentSessionPromise` second
 * argument, not via these presentation-mode options.
 */
export type LPMStartOptions = LPMPresentationModeOptions;

export type LPMOneTimePaymentSessionPromise = Promise<
  {
    orderId: string;
  } & LPMSessionFields
>;

export type LPMOneTimePaymentSession = Omit<BasePaymentSession, "start"> & {
  start: (
    options: LPMStartOptions,
    paymentSessionPromise?: LPMOneTimePaymentSessionPromise,
  ) => Promise<void>;
  createPaymentFields: (options: { type: "email" | "name" | "tax_id" | "tax_id_type"; style?: Record<string, unknown>; value?: string }) => HTMLElement;
  validate: () => Promise<boolean>;
};

/**
 * Single source of truth mapping each LPM component to the session-creation
 * method it adds to the SDK instance. `LPMComponents` and `LPMSessionMethodName`
 * are both derived from this map so they can never drift out of alignment, and
 * {@link LPMInstanceFor} uses it to narrow the instance type to only the methods
 * for the components actually requested in `createInstance`.
 */
export type LPMComponentToSessionMethod = {
  "ideal-payments": "createIdealOneTimePaymentSession";
  "bancontact-payments": "createBancontactOneTimePaymentSession";
  "eps-payments": "createEpsOneTimePaymentSession";
  "blik-payments": "createBlikOneTimePaymentSession";
  "mybank-payments": "createMyBankOneTimePaymentSession";
  "trustly-payments": "createTrustlyOneTimePaymentSession";
  "p24-payments": "createP24OneTimePaymentSession";
  "multibanco-payments": "createMultibancoOneTimePaymentSession";
  "bizum-payments": "createBizumOneTimePaymentSession";
  "swish-payments": "createSwishOneTimePaymentSession";
  "klarna-payments": "createKlarnaOneTimePaymentSession";
  "twint-payments": "createTwintOneTimePaymentSession";
  "wechatpay-payments": "createWechatpayOneTimePaymentSession";
  "afterpay-payments": "createAfterpayOneTimePaymentSession";
  "oxxopay-payments": "createOxxopayOneTimePaymentSession";
  "boletobancario-payments": "createBoletobancarioOneTimePaymentSession";
  "verkkopankki-payments": "createVerkkopankkiOneTimePaymentSession";
  "payu-payments": "createPayuOneTimePaymentSession";
  "paysafecard-payments": "createPaysafecardOneTimePaymentSession";
  "mbway-payments": "createMbWayOneTimePaymentSession";
  "satispay-payments": "createSatispayOneTimePaymentSession";
  "wero-payments": "createWeroOneTimePaymentSession";
  "floa-payments": "createFloaOneTimePaymentSession";
  "scalapay-payments": "createScalapayOneTimePaymentSession";
  "grabpay-payments": "createGrabpayOneTimePaymentSession";
  "pix-international-payments": "createPixInternationalOneTimePaymentSession";
  "sepa-payments": "createSepaOneTimePaymentSession";
  "crypto-payments": "createCryptoOneTimePaymentSession";
  "doku-payments": "createDOKUOneTimePaymentSession";
  "dragonpay-payments": "createDragonpayOneTimePaymentSession";
  "estoniabank-payments": "createEstoniaOneTimePaymentSession";
  "fpx-payments": "createFpxOneTimePaymentSession";
  "gopay-payments": "createGopayOneTimePaymentSession";
  "alipay-payments": "createAlipayOneTimePaymentSession";
  "indomaret-payments": "createIndomaretOneTimePaymentSession";
  "indonesiabanks-payments": "createIndonesiaBanksOneTimePaymentSession";
  "kredivo-payments": "createKredivoOneTimePaymentSession";
  "linkaja-payments": "createLinkajaOneTimePaymentSession";
  "ovo-payments": "createOvoOneTimePaymentSession";
  "paysera-payments": "createPayseraOneTimePaymentSession";
  "skrill-payments": "createSkrillOneTimePaymentSession";
  "thailand-banks-payments": "createThailandBanksOneTimePaymentSession";
  "blikpaylater-payments": "createBlikPayLaterOneTimePaymentSession";
  "alfamart-payments": "createAlfamartOneTimePaymentSession";
  "zip-payments": "createZipOneTimePaymentSession";
  "bancomatpay-payments": "createBancomatPayOneTimePaymentSession";
  "latviabanks-payments": "createLatviaBanksOneTimePaymentSession";
  "fiuu-cash-payments": "createFIUUOneTimePaymentSession";
  "lithuaniabanks-payments": "createLithuaniaBanksOneTimePaymentSession";
  "jeniuspay-payments": "createJeniuspayOneTimePaymentSession";
};

export type LPMComponents = keyof LPMComponentToSessionMethod;

export type LPMSessionMethodName =
  LPMComponentToSessionMethod[keyof LPMComponentToSessionMethod];

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

/**
 * Narrows {@link LPMPaymentsInstance} down to only the session-creation methods
 * for the LPM components present in `T`. Requesting `["ideal-payments"]` yields
 * only `createIdealOneTimePaymentSession`, instead of all LPM methods.
 * `T` is generic over `readonly string[]` (rather than `Components[]`) to avoid
 * a circular import with `../index`; non-LPM entries in `T` are ignored via
 * `Extract`, and an empty extraction resolves to `{}` (a no-op intersection).
 */
export type LPMInstanceFor<T extends readonly string[]> = {
  [C in Extract<
    T[number],
    LPMComponents
  > as LPMComponentToSessionMethod[C]]: (
    options: LPMOneTimePaymentSessionOptions,
  ) => LPMOneTimePaymentSession;
};
