import React from "react";

import { usePayPalOneTimePaymentSession } from "../hooks/usePayPalOneTimePaymentSession";

import type { ButtonProps } from "../types/sdkButtons";
import type { UsePayPalOneTimePaymentSessionProps } from "../hooks/usePayPalOneTimePaymentSession";

type PayPalOneTimePaymentButtonProps = UsePayPalOneTimePaymentSessionProps &
    ButtonProps;

export const PayPalOneTimePaymentButton = ({
    // TODO add type for button type?
    type,
    disabled,
    ...hookProps
    // TODO not sure the return type is correct, but I can't seem to specify a paypal-button is returned specifically
}: PayPalOneTimePaymentButtonProps): JSX.Element => {
    const { handleClick } = usePayPalOneTimePaymentSession(hookProps);

    // TODO SSR
    // TODO the rest of the props for the component
    // TODO tests

    return (
        <paypal-button
            onClick={handleClick}
            type={type}
            disabled={disabled}
        ></paypal-button>
    );
};
