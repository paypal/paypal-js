import React, { useEffect } from "react";

import { usePayLaterOneTimePaymentSession } from "../hooks/usePayLaterOneTimePaymentSession";
import { usePayPal } from "../hooks/usePayPal";
import { isServer } from "../utils";

import type { PayLaterButtonProps } from "../types";
import type { PayLaterOneTimePaymentSessionProps } from "../hooks/usePayLaterOneTimePaymentSession";

type PayLaterOneTimePaymentButtonProps = PayLaterOneTimePaymentSessionProps &
    Omit<PayLaterButtonProps, "autoRedirect"> & {
        autoRedirect?: never;
    };

/**
 * `PayLaterOneTimePaymentButton` is a button that provides a PayLater payment flow.
 *
 * `PayLaterOneTimePaymentButtonProps` combines the arguments for {@link PayLaterOneTimePaymentSessionProps}
 * and {@link PayLaterButtonProps}.
 *
 * The `countryCode` and `productCode` props are automatically populated from the eligibility API response
 * (available via `usePayPal().eligiblePaymentMethods`) if available. These props can be provided manually
 * as overrides.
 *
 * Note, `autoRedirect` is not allowed because if given a `presentationMode` of `"redirect"` the button
 * would not be able to provide back `redirectURL` from `start`. Advanced integrations that need
 * `redirectURL` should use the {@link usePayLaterOneTimePaymentSession} hook directly.
 *
 * @example
 * // Basic usage with eligibility (countryCode and productCode auto-populated)
 * <PayLaterOneTimePaymentButton
 *   onApprove={() => {
 *      // ... on approve logic
 *   }}
 *   orderId="your-order-id"
 *   presentationMode="auto"
 * />
 *
 * @example
 * // Manual override of countryCode and productCode
 * <PayLaterOneTimePaymentButton
 *   onApprove={() => {
 *      // ... on approve logic
 *   }}
 *   orderId="your-order-id"
 *   presentationMode="auto"
 *   countryCode="US"
 *   productCode="PAYLATER"
 * />
 */
export const PayLaterOneTimePaymentButton = ({
    countryCode: countryCodeProp,
    productCode: productCodeProp,
    disabled = false,
    ...hookProps
}: PayLaterOneTimePaymentButtonProps): JSX.Element | null => {
    const { error, handleClick } = usePayLaterOneTimePaymentSession(hookProps);
    const { eligiblePaymentMethods } = usePayPal();
    const isServerSide = isServer();

    const payLaterDetails =
        eligiblePaymentMethods?.eligible_methods?.paypal_pay_later;
    const countryCode = countryCodeProp ?? payLaterDetails?.country_code;
    const productCode = productCodeProp ?? payLaterDetails?.product_code;

    useEffect(() => {
        if (error) {
            console.error(error);
        }
    }, [error]);

    return isServerSide ? (
        <div />
    ) : (
        <paypal-pay-later-button
            onClick={handleClick}
            countryCode={countryCode}
            productCode={productCode}
            disabled={disabled || error !== null ? true : undefined}
        ></paypal-pay-later-button>
    );
};
