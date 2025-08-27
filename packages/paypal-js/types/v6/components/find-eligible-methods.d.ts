import {
    PayLaterCountryCodes,
    PayLaterProductCodes,
    PayPalCreditCountryCodes,
} from "./paypal-payments";

export type EligiblePaymentMethods =
    | "paypal_pay_later"
    | "paypal_credit"
    | "paypal"
    | "venmo";

export type FindEligibleMethodsOptions = {
    currencyCode?: string;
};

export type FundingSource =
    | "ach"
    | "advanced_cards"
    | "applepay"
    | "bancontact"
    | "blik"
    | "boletobancario"
    | "card"
    | "credit"
    | "eps"
    | "giropay"
    | "googlepay"
    | "ideal"
    | "itau"
    | "maxima"
    | "mercadopago"
    | "multibanco"
    | "mybank"
    | "oxxo"
    | "p24"
    | "paidy"
    | "paylater"
    | "paypal"
    | "payu"
    | "satispay"
    | "sepa"
    | "sofort"
    | "trustly"
    | "venmo"
    | "verkkopankki"
    | "wechatpay"
    | "zimpler";

type BaseEligiblePaymentMethodDetails = {
    canBeVaulted: boolean;
};

type CreditEligiblePaymentMethodDetails = BaseEligiblePaymentMethodDetails & {
    countryCode: PayPalCreditCountryCodes;
};

type PayLaterEligiblePaymentMethodDetails = BaseEligiblePaymentMethodDetails & {
    countryCode: PayLaterCountryCodes;
    productCode: PayLaterProductCodes;
};

export type FindEligibleMethodsGetDetails<T extends FundingSource> =
    T extends "credit"
        ? CreditEligiblePaymentMethodDetails
        : T extends "paylater"
          ? PayLaterEligiblePaymentMethodDetails
          : BaseEligiblePaymentMethodDetails;

export interface EligiblePaymentMethodsOutput {
    isEligible: (paymentMethod: FundingSource) => boolean;
    getDetails: <T extends FundingSource>(
        fundingSource: T,
    ) => FindEligibleMethodsGetDetails<T>;
}
