import React, { useEffect } from "react";

import { usePayLaterOneTimePaymentSession } from "../hooks/usePayLaterOneTimePaymentSession";
import { usePayPal } from "../hooks/usePayPal";
import { isServer } from "../utils";

import type { PayLaterOneTimePaymentSessionProps } from "../hooks/usePayLaterOneTimePaymentSession";

type PayLaterOneTimePaymentButtonProps = PayLaterOneTimePaymentSessionProps & {
    autoRedirect?: never;
    disabled?: boolean;
};

/**
 * `PayLaterOneTimePaymentButton` is a button that provides a PayLater payment flow.
 *
 * The `countryCode` and `productCode` are automatically populated from the eligibility API response
 * (available via `usePayPal().eligiblePaymentMethods`). The button requires eligibility to be configured
 * in the parent `PayPalProvider`.
 *
 * Note, `autoRedirect` is not allowed because if given a `presentationMode` of `"redirect"` the button
 * would not be able to provide back `redirectURL` from `start`. Advanced integrations that need
 * `redirectURL` should use the {@link usePayLaterOneTimePaymentSession} hook directly.
 *
 * @example
 * <PayLaterOneTimePaymentButton
 *   onApprove={() => {
 *      // ... on approve logic
 *   }}
 *   orderId="your-order-id"
 *   presentationMode="auto"
 * />
 */
export const PayLaterOneTimePaymentButton = ({
    disabled = false,
    ...hookProps
}: PayLaterOneTimePaymentButtonProps): JSX.Element | null => {
    const { error, handleClick } = usePayLaterOneTimePaymentSession(hookProps);
    const { eligiblePaymentMethods } = usePayPal();
    const isServerSide = isServer();

    const payLaterDetails =
        eligiblePaymentMethods?.eligible_methods?.paypal_pay_later;
    const countryCode = payLaterDetails?.country_code;
    const productCode = payLaterDetails?.product_code;

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
            disabled={disabled || !!error || undefined}
        ></paypal-pay-later-button>
    );
};
