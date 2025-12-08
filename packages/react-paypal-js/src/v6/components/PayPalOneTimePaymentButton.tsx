import React, { useEffect } from "react";

import { usePayPalOneTimePaymentSession } from "../hooks/usePayPalOneTimePaymentSession";
import { isServer } from "../utils";

import type { ButtonProps } from "../types";
import type { UsePayPalOneTimePaymentSessionProps } from "../hooks/usePayPalOneTimePaymentSession";

type PayPalOneTimePaymentButtonProps = UsePayPalOneTimePaymentSessionProps &
    ButtonProps & {
        autoRedirect?: never;
    };

/**
 * `PayPalOneTimePaymentButton` is a button that provides a standard PayPal payment flow.
 *
 * `PayPalOneTimePaymentButtonProps` combines the arguments for {@link UsePayPalOneTimePaymentSessionProps}
 * and {@link ButtonProps}.
 *
 * Note, `autoRedirect` is not allowed because if given a `presentationMode` of `"redirect"` the button
 * would not be able to provide back `redirectURL` from `start`. Advanced integrations that need
 * `redirectURL` should use the {@link usePayPalOneTimePaymentSession} hook directly.
 *
 * @example
 * <PayPalOneTimePaymentButton
 *   onApprove={() => {
 *      // ... on approve logic
 *   }}
 *   orderId="your-order-id"
 *   presentationMode="auto"
 * />
 */
export const PayPalOneTimePaymentButton = ({
    type = "pay",
    disabled = false,
    ...hookProps
}: PayPalOneTimePaymentButtonProps): JSX.Element | null => {
    const { error, handleClick } = usePayPalOneTimePaymentSession(hookProps);
    const isServerSide = isServer();

    useEffect(() => {
        if (error) {
            console.error(error);
        }
    }, [error]);

    return isServerSide ? (
        <div />
    ) : (
        <paypal-button
            onClick={handleClick}
            type={type}
            disabled={disabled || error !== null ? true : undefined}
        ></paypal-button>
    );
};
