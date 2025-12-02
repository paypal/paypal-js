import React, { useEffect } from "react";

import { usePayPalOneTimePaymentSession } from "../hooks/usePayPalOneTimePaymentSession";
import { isServer } from "../utils";

import type { ButtonProps } from "../types";
import type { UsePayPalOneTimePaymentSessionProps } from "../hooks/usePayPalOneTimePaymentSession";

/**
 * `PayPalOneTimePaymentButtonProps` combines the arguments for {@link UsePayPalOneTimePaymentSessionProps}
 * and {@link ButtonProps}.
 *
 * Note, `autoRedirect` is not allowed because if given a `presentationMode` of `"redirect"` the button
 * would not be able to provide back `redirectURL` from `start`. Advanced integrations that need
 * `redirectURL` should use the session hook directly.
 */
type PayPalOneTimePaymentButtonProps = UsePayPalOneTimePaymentSessionProps &
    ButtonProps & {
        autoRedirect?: never;
    };

// TODO docs
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
