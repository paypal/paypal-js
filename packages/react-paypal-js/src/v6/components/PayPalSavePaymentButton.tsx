import React, { useEffect } from "react";

import { usePayPalSavePaymentSession } from "../hooks/usePayPalSavePaymentSession";
import { isServer } from "../utils";

import type { ButtonProps } from "../types";
import type { PayPalSavePaymentSessionProps } from "../hooks/usePayPalSavePaymentSession";

type PayPalSavePaymentButtonProps = PayPalSavePaymentSessionProps &
    ButtonProps & {
        autoRedirect?: never;
    };

/**
 * `PayPalSavePaymentButton` is a button that provides a PayPal vault/save payment flow
 * (without purchase).
 *
 * `PayPalSavePaymentButtonProps` combines the arguments for {@link PayPalSavePaymentSessionProps}
 * and {@link ButtonProps}.
 *
 * Note, `autoRedirect` is not allowed because if given a `presentationMode` of `"redirect"` the button
 * would not be able to provide back `redirectURL` from `start`. Advanced integrations that need
 * `redirectURL` should use the {@link usePayPalSavePaymentSession} hook directly.
 *
 * @example
 * <PayPalSavePaymentButton
 *   onApprove={() => {
 *      // ... on approve logic
 *   }}
 *   vaultSetupToken="your-vault-setup-token"
 *   presentationMode="auto"
 * />
 */
export const PayPalSavePaymentButton = ({
    type = "pay",
    disabled = false,
    ...hookProps
}: PayPalSavePaymentButtonProps): JSX.Element | null => {
    const { error, isPending, handleClick } =
        usePayPalSavePaymentSession(hookProps);
    const isServerSide = isServer();

    useEffect(() => {
        if (error) {
            console.error(error);
        }
    }, [error]);

    if (isPending) {
        return null;
    }

    return isServerSide ? (
        <div />
    ) : (
        <paypal-button
            type={type}
            disabled={disabled || error !== null ? true : undefined}
            onClick={handleClick}
        ></paypal-button>
    );
};
