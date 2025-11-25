import React, { useCallback } from "react";

import { usePayPalOneTimePaymentSession } from "../hooks/usePayPalOneTimePaymentSession";
import { isServer } from "../utils";

import type { ButtonProps } from "../types/sdkButtons";
import type { UsePayPalOneTimePaymentSessionProps } from "../hooks/usePayPalOneTimePaymentSession";

/**
 * `PayPalOneTimePaymentButtonProps` combines the arguments for {@link UsePayPalOneTimePaymentSessionProps}
 * and {@link ButtonProps}.
 *
 * Note, `autoRedirect` is not allowed because if given a `presentationMode` of `"redirect"` the button
 * would not be able to provide back `redirectURL` from `start`. Advanced integrations that need
 * `redirectURL` should use the session hook directly.
 */
type PayPalOneTimePaymentButtonProps = UsePayPalOneTimePaymentSessionProps & {
    autoRedirect?: never;
} & ButtonProps;

// TODO docs
export const PayPalOneTimePaymentButton = ({
    // TODO add type for button type?
    // TODO does type come from the hook return or is this something merchants pass in?
    type,
    ...hookProps
    // TODO not sure the return type is correct, but I can't seem to specify a paypal-button is returned specifically
}: PayPalOneTimePaymentButtonProps): JSX.Element | null => {
    const { error, handleClick } = usePayPalOneTimePaymentSession(hookProps);
    const isServerSide = isServer();

    useCallback(() => {
        if (error) {
            console.error(error);
        }
    }, [error]);

    // TODO tests

    return isServerSide ? null : (
        <paypal-button
            onClick={handleClick}
            type={type}
            disabled={error !== null}
        ></paypal-button>
    );
};
