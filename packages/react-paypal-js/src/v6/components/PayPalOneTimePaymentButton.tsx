import React, { useCallback } from "react";

import { usePayPalOneTimePaymentSession } from "../hooks/usePayPalOneTimePaymentSession";
import { isServer } from "../utils";
import { BUTTON_TYPES } from "../types";

import type { IntrinsicButtonProps } from "../types";
import type { UsePayPalOneTimePaymentSessionProps } from "../hooks/usePayPalOneTimePaymentSession";

/**
 * `PayPalOneTimePaymentButtonProps` combines the arguments for {@link UsePayPalOneTimePaymentSessionProps}
 * and {@link IntrinsicButtonProps}.
 *
 * Note, `autoRedirect` is not allowed because if given a `presentationMode` of `"redirect"` the button
 * would not be able to provide back `redirectURL` from `start`. Advanced integrations that need
 * `redirectURL` should use the session hook directly.
 */
type PayPalOneTimePaymentButtonProps = UsePayPalOneTimePaymentSessionProps &
    IntrinsicButtonProps & {
        autoRedirect?: never;
    };

// TODO docs
export const PayPalOneTimePaymentButton = ({
    type = BUTTON_TYPES.PAY,
    disabled = false,
    ...hookProps
}: PayPalOneTimePaymentButtonProps): JSX.Element | null => {
    const { error, handleClick } = usePayPalOneTimePaymentSession(hookProps);
    const isServerSide = isServer();

    useCallback(() => {
        if (error) {
            console.error(error);
        }
    }, [error]);

    // TODO tests

    return isServerSide ? (
        <div />
    ) : (
        <paypal-button
            onClick={handleClick}
            type={type}
            disabled={disabled || error !== null}
        ></paypal-button>
    );
};
