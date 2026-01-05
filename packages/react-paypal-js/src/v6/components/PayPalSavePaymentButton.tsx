import React, { useEffect } from "react";

import { usePayPalSavePaymentSession } from "../hooks/usePayPalSavePaymentSession";
import { isServer } from "../utils";

import type { ButtonProps } from "../types";
import type { PayPalSavePaymentSessionProps } from "../hooks/usePayPalSavePaymentSession";

type PayPalSavePaymentButtonProps = PayPalSavePaymentSessionProps &
    ButtonProps & {
        autoRedirect?: never;
    };

export const PayPalSavePaymentButton = ({
    type = "pay",
    disabled = false,
    ...hookProps
}: PayPalSavePaymentButtonProps): JSX.Element | null => {
    const { error, handleClick } = usePayPalSavePaymentSession(hookProps);
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
            type={type}
            disabled={disabled || error !== null ? true : undefined}
            onClick={handleClick}
        ></paypal-button>
    );
};
