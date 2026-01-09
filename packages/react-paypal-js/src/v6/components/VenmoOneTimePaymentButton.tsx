import React, { useEffect } from "react";

import { useVenmoOneTimePaymentSession } from "../hooks/useVenmoOneTimePaymentSession";
import { isServer } from "../utils";

import type { ButtonProps } from "../types";
import type { UseVenmoOneTimePaymentSessionProps } from "../hooks/useVenmoOneTimePaymentSession";

type VenmoOneTimePaymentButtonProps = UseVenmoOneTimePaymentSessionProps &
    ButtonProps & {
        autoRedirect?: never;
    };

/**
 * `VenmoOneTimePaymentButton` is a button that provides a standard Venmo payment flow.
 *
 * `VenmoOneTimePaymentButtonProps` combines the arguments for {@link UseVenmoOneTimePaymentSessionProps}
 * and {@link ButtonProps}.
 *
 * @example
 * <VenmoOneTimePaymentButton
 *   onApprove={() => {
 *      // ... on approve logic
 *   }}
 *   orderId="your-order-id"
 *   presentationMode="auto"
 * />
 */
export const VenmoOneTimePaymentButton = ({
    type = "pay",
    disabled = false,
    ...hookProps
}: VenmoOneTimePaymentButtonProps): JSX.Element | null => {
    const { error, isPending, handleClick } =
        useVenmoOneTimePaymentSession(hookProps);
    const isServerSide = isServer();

    useEffect(() => {
        if (error) {
            console.error(error);
        }
    }, [error]);

    return isServerSide ? (
        <div />
    ) : (
        <venmo-button
            onClick={handleClick}
            type={type}
            disabled={
                disabled || isPending || error !== null ? true : undefined
            }
        ></venmo-button>
    );
};
