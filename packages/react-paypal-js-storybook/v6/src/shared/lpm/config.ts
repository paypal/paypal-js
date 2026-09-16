import type {
  FundingSource,
  LPMName,
  LPMSessionFields,
} from "@paypal/react-paypal-js/sdk-v6";

export interface LPMStoryConfig {
  currencyCode: string;
  fundingSource: FundingSource;
  sessionFieldValues?: LPMSessionFields;
}

const CURRENCY_BY_LPM = {
  ideal: "EUR",
  bancontact: "EUR",
  eps: "EUR",
  blik: "PLN",
  mybank: "EUR",
  trustly: "SEK",
  p24: "PLN",
  multibanco: "EUR",
  bizum: "EUR",
  swish: "SEK",
  twint: "CHF",
  wechatpay: "CNY",
  verkkopankki: "EUR",
  payu: "PLN",
  mbway: "EUR",
  satispay: "EUR",
  wero: "EUR",
  floa: "EUR",
  grabpay: "SGD",
  pixInternational: "BRL",
  sepa: "EUR",
  doku: "IDR",
  estonia: "EUR",
  gopay: "IDR",
  alipay: "CNY",
  indonesiaBanks: "IDR",
  kredivo: "IDR",
  linkaja: "IDR",
  ovo: "IDR",
  paysera: "EUR",
  skrill: "EUR",
  blikPayLater: "PLN",
  bancomatPay: "EUR",
  jeniuspay: "IDR",
  klarna: "SEK",
  afterpay: "AUD",
  oxxopay: "MXN",
  boletobancario: "BRL",
  paysafecard: "EUR",
  scalapay: "EUR",
  crypto: "USD",
  dragonpay: "PHP",
  fpx: "MYR",
  indomaret: "IDR",
  thailandBanks: "THB",
  alfamart: "IDR",
  zip: "AUD",
  latviaBanks: "EUR",
  fiuu: "MYR",
  lithuaniaBanks: "EUR",
} as const satisfies Record<LPMName, string>;

const FUNDING_SOURCE_BY_LPM = {
  ideal: "ideal",
  bancontact: "bancontact",
  eps: "eps",
  blik: "blik",
  mybank: "mybank",
  trustly: "trustly",
  p24: "p24",
  multibanco: "multibanco",
  bizum: "bizum",
  swish: "swish",
  twint: "twint",
  wechatpay: "wechatpay",
  verkkopankki: "verkkopankki",
  payu: "payu",
  mbway: "mbway",
  satispay: "satispay",
  wero: "wero",
  floa: "floa_pay",
  grabpay: "grabpay",
  pixInternational: "pix_international",
  sepa: "sepa",
  doku: "doku",
  estonia: "estonia_banks",
  gopay: "gopay",
  alipay: "alipay",
  indonesiaBanks: "indonesia_banks",
  kredivo: "kredivo",
  linkaja: "linkaja",
  ovo: "ovo",
  paysera: "paysera",
  skrill: "skrill",
  blikPayLater: "blik_pay_later",
  bancomatPay: "bancomatpay",
  jeniuspay: "jenius_pay",
  klarna: "klarna",
  afterpay: "afterpay",
  oxxopay: "oxxo_pay",
  boletobancario: "boletobancario",
  paysafecard: "paysafecard",
  scalapay: "scalapay",
  crypto: "crypto",
  dragonpay: "dragonpay",
  fpx: "fpx",
  indomaret: "indomaret",
  thailandBanks: "thailand_banks",
  alfamart: "alfamart",
  zip: "zip",
  latviaBanks: "latvia_banks",
  fiuu: "fiuu_cash",
  lithuaniaBanks: "lithuania_banks",
} as const satisfies Record<LPMName, FundingSource>;

const PHONE_NUMBERS = {
  AU: { countryCode: "61", nationalNumber: "412345678" },
  ID: { countryCode: "62", nationalNumber: "81234567890" },
  IT: { countryCode: "39", nationalNumber: "3123456789" },
  PH: { countryCode: "63", nationalNumber: "9171234567" },
  PT: { countryCode: "351", nationalNumber: "912345678" },
  SE: { countryCode: "46", nationalNumber: "701234567" },
} as const;

const AU_BILLING_ADDRESS = {
  addressLine1: "123 George Street",
  addressLine2: "",
  adminArea1: "NSW",
  adminArea2: "Sydney",
  postalCode: "2000",
  countryCode: "AU",
};

const BR_BILLING_ADDRESS = {
  addressLine1: "123 Avenida Paulista",
  addressLine2: "",
  adminArea1: "SP",
  adminArea2: "Sao Paulo",
  postalCode: "01310-100",
  countryCode: "BR",
};

const SE_BILLING_ADDRESS = {
  addressLine1: "1 Drottninggatan",
  addressLine2: "",
  adminArea1: "Stockholm",
  adminArea2: "Stockholm",
  postalCode: "111 51",
  countryCode: "SE",
};

const SESSION_FIELDS_BY_LPM = {
  afterpay: { billingAddress: AU_BILLING_ADDRESS },
  alfamart: { phone: PHONE_NUMBERS.ID },
  bancomatPay: { phone: PHONE_NUMBERS.IT },
  boletobancario: {
    billingAddress: BR_BILLING_ADDRESS,
    taxInfo: { taxId: "52998224725", taxIdType: "BR_CPF" },
    expiryDate: { expiry_date: "2030-12-31" },
  },
  doku: { phone: PHONE_NUMBERS.ID },
  dragonpay: { phone: PHONE_NUMBERS.PH },
  floa: { dateOfBirth: "1990-01-15", numberOfInstallments: 3 },
  gopay: { phone: PHONE_NUMBERS.ID },
  indomaret: { phone: PHONE_NUMBERS.ID },
  indonesiaBanks: { phone: PHONE_NUMBERS.ID },
  jeniuspay: { phone: PHONE_NUMBERS.ID },
  klarna: {
    phone: PHONE_NUMBERS.SE,
    billingAddress: SE_BILLING_ADDRESS,
  },
  kredivo: { phone: PHONE_NUMBERS.ID },
  linkaja: { phone: PHONE_NUMBERS.ID },
  mbway: { phone: PHONE_NUMBERS.PT },
  ovo: { phone: PHONE_NUMBERS.ID },
  oxxopay: { expiryDate: { expiry_date: "2030-12-31" } },
  pixInternational: {
    taxInfo: { taxId: "52998224725", taxIdType: "BR_CPF" },
  },
  scalapay: { phone: PHONE_NUMBERS.IT },
  zip: {
    phone: PHONE_NUMBERS.AU,
    billingAddress: AU_BILLING_ADDRESS,
  },
} as const satisfies Partial<Record<LPMName, LPMSessionFields>>;

export function getLPMStoryConfig(lpm: LPMName): LPMStoryConfig {
  return {
    currencyCode: CURRENCY_BY_LPM[lpm],
    fundingSource: FUNDING_SOURCE_BY_LPM[lpm],
    sessionFieldValues:
      SESSION_FIELDS_BY_LPM[lpm as keyof typeof SESSION_FIELDS_BY_LPM],
  };
}
