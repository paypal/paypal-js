import React, { useEffect } from "react";

import { usePayPalGuestPaymentSession } from "../hooks/usePayPalGuestPaymentSession";
import { usePayPal } from "../hooks/usePayPal";

import type { UsePayPalGuestPaymentSessionProps } from "../hooks/usePayPalGuestPaymentSession";

type PayPalGuestPaymentButtonProps = UsePayPalGuestPaymentSessionProps & {
    disabled?: boolean;
};

/**
 * `PayPalGuestPaymentButton` is a button that provides a guest checkout (BCDC) payment flow.
 *
 * This component automatically wraps the button with `<paypal-basic-card-container>` which is
 * required for the guest checkout form to display properly.
 *
 * `PayPalGuestPaymentButtonProps` combines the arguments for {@link UsePayPalGuestPaymentSessionProps}.
 *
 * @example
 * <PayPalGuestPaymentButton
 *   createOrder={createOrder}
 *   onApprove={() => {
 *      // ... on approve logic
 *   }}
 * />
 */
export const PayPalGuestPaymentButton = ({
    disabled = false,
    ...hookProps
}: PayPalGuestPaymentButtonProps): JSX.Element | null => {
    const { error, isPending, handleClick, buttonRef } =
        usePayPalGuestPaymentSession(hookProps);
    const { isHydrated } = usePayPal();

    useEffect(() => {
        if (error) {
            console.error(error);
        }
    }, [error]);

    if (!isHydrated) {
        return <div />;
    }

    return (
        <paypal-basic-card-container>
            <paypal-basic-card-button
                ref={buttonRef}
                onClick={handleClick}
                disabled={
                    disabled || isPending || error !== null ? true : undefined
                }
            ></paypal-basic-card-button>
        </paypal-basic-card-container>
    );
};
