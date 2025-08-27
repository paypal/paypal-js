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

export type FundingSource = "credit" | "paylater" | "paypal" | "venmo";

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
