import React, { useEffect } from "react";

import { useVenmoOneTimePaymentSession } from "../hooks/useVenmoOneTimePaymentSession";
import { usePayPal } from "../hooks/usePayPal";

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
 * Note, `autoRedirect` is not allowed because if given a `presentationMode` of `"redirect"` the button
 * would not be able to provide back `redirectURL` from `start`. Advanced integrations that need
 * `redirectURL` should use the {@link useVenmoOneTimePaymentSession} hook directly.
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
    const { isHydrated } = usePayPal();

    useEffect(() => {
        if (error) {
            console.error(error);
        }
    }, [error]);

    return isHydrated ? (
        <venmo-button
            onClick={handleClick}
            type={type}
            disabled={
                disabled || isPending || error !== null ? true : undefined
            }
        ></venmo-button>
    ) : (
        <div />
    );
};
