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

/**
 * Result object returned by `findEligibleMethods()` containing methods to check payment method eligibility and retrieve payment method details.
 *
 * @remarks
 * This interface is returned by the SDK's `findEligibleMethods()` method. It provides
 * utilities to determine which PayPal payment methods are available and to retrieve details for payment setup.
 *
 * @example
 * ```typescript
 * const paymentMethods = await sdkInstance.findEligibleMethods({
 *   currencyCode: "USD",
 * });
 *
 * if (paymentMethods.isEligible("paypal")) {
 *   const paypalPaymentSession = sdkInstance.createPayPalOneTimePaymentSession({
 *     onApprove: (data) => console.log('Payment approved:', data),
 *   });
 *   // set up button
 *   ...
 * }
 *
 * if (paymentMethods.isEligible("paylater")) {
 *   const paylaterPaymentMethodDetails = paymentMethods.getDetails("paylater");
 *   const { productCode, countryCode } = paylaterPaymentMethodDetails;
 *
 *   const paylaterPaymentSession = sdkInstance.createPayLaterOneTimePaymentSession({
 *     onApprove: (data) => console.log('Pay Later approved:', data),
 *   });
 *
 *   // set up button
 *   const paylaterButton = document.querySelector("#paylater-button");
 *   paylaterButton.productCode = productCode;
 *   paylaterButton.countryCode = countryCode;
 *   ...
 * }
 *
 * if (paymentMethods.isEligible("credit")) {
 *   const paypalCreditPaymentMethodDetails = paymentMethods.getDetails("credit");
 *   const { countryCode } = paypalCreditPaymentMethodDetails;
 *
 *   const paypalCreditPaymentSession = sdkInstance.createPayPalCreditOneTimePaymentSession({
 *     onApprove: (data) => console.log('Credit approved:', data),
 *   });
 *
 *   // set up button
 *   const paypalCreditButton = document.querySelector("#paypal-credit-button");
 *   paypalCreditButton.countryCode = countryCode;
 *   ...
 * }
 * ```
 */
export interface EligiblePaymentMethodsOutput {
    /**
     * Determines if a specific payment method is eligible.
     *
     * @param paymentMethod - The funding source to check eligibility for
     * @returns `true` if the payment method is eligible, `false` otherwise
     */
    isEligible: (paymentMethod: FundingSource) => boolean;
    /**
     * Retrieves details for a specific funding source.
     *
     * @param fundingSource - The funding source to get details for
     * @returns Configuration details including country codes, product codes, and vaulting capabilities
     */
    getDetails: <T extends FundingSource>(
        fundingSource: T,
    ) => FindEligibleMethodsGetDetails<T>;
}
