import React, { useEffect } from "react";

import { usePayLaterOneTimePaymentSession } from "../hooks/usePayLaterOneTimePaymentSession";
import { isServer } from "../utils";

import type { PayLaterButtonProps } from "../types";
import type { PayLaterOneTimePaymentSessionProps } from "../hooks/usePayLaterOneTimePaymentSession";

type PayLaterOneTimePaymentButtonProps = PayLaterOneTimePaymentSessionProps &
    PayLaterButtonProps & {
        autoRedirect?: never;
    };

/**
 * `PayLaterOneTimePaymentButton` is a button that provides a PayLater payment flow.
 *
 * `PayLaterOneTimePaymentButtonProps` combines the arguments for {@link PayLaterOneTimePaymentSessionProps}
 * and {@link PayLaterButtonProps}.
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
 *   countryCode="US"
 *   productCode="PAYLATER"
 * />
 */
export const PayLaterOneTimePaymentButton = ({
    countryCode,
    productCode,
    disabled = false,
    ...hookProps
}: PayLaterOneTimePaymentButtonProps): JSX.Element | null => {
    const { error, handleClick } = usePayLaterOneTimePaymentSession(hookProps);
    const isServerSide = isServer();

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
