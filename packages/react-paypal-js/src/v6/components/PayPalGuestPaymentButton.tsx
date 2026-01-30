"use client";

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
 * `PayPalGuestPaymentButtonProps` combines the arguments for {@link UsePayPalGuestPaymentSessionProps}.
 *
 * @example
 * <PayPalGuestPaymentButton
 *   onApprove={() => {
 *      // ... on approve logic
 *   }}
 *   orderId="your-order-id"
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

    return isHydrated ? (
        <paypal-basic-card-button
            ref={buttonRef}
            onClick={handleClick}
            disabled={
                disabled || isPending || error !== null ? true : undefined
            }
        ></paypal-basic-card-button>
    ) : (
        <div />
    );
};
