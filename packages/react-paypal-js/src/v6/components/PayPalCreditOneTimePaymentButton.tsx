import React, { useEffect } from "react";

import { usePayPalCreditOneTimePaymentSession } from "../hooks/usePayPalCreditOneTimePaymentSession";
import { usePayPal } from "../hooks/usePayPal";

import type { UsePayPalCreditOneTimePaymentSessionProps } from "../hooks/usePayPalCreditOneTimePaymentSession";

export type PayPalCreditOneTimePaymentButtonProps =
    UsePayPalCreditOneTimePaymentSessionProps & {
        autoRedirect?: never;
        disabled?: boolean;
    };

/**
 * `PayPalCreditOneTimePaymentButton` is a button that provides a PayPal Credit payment flow.
 *
 * The `countryCode` is automatically populated from the eligibility API response
 * (available via `usePayPal().eligiblePaymentMethods`). The button requires eligibility to be configured
 * in the parent `PayPalProvider`, using either the `useEligibleMethods` hook client-side or `useFetchEligibleMethods` server-side.
 *
 * Note, `autoRedirect` is not allowed because if given a `presentationMode` of `"redirect"` the button
 * would not be able to provide back `redirectURL` from `start`. Advanced integrations that need
 * `redirectURL` should use the {@link usePayPalCreditOneTimePaymentSession} hook directly.
 *
 * @example
 * <PayPalCreditOneTimePaymentButton
 *   onApprove={() => {
 *      // ... on approve logic
 *   }}
 *   orderId="your-order-id"
 *   presentationMode="auto"
 * />
 */
export const PayPalCreditOneTimePaymentButton = ({
    disabled = false,
    ...hookProps
}: PayPalCreditOneTimePaymentButtonProps): JSX.Element | null => {
    const { eligiblePaymentMethods, isHydrated } = usePayPal();
    const { error, isPending, handleClick } =
        usePayPalCreditOneTimePaymentSession(hookProps);

    const creditDetails = eligiblePaymentMethods?.getDetails("credit");
    const countryCode = creditDetails?.countryCode;

    useEffect(() => {
        if (error) {
            console.error(error);
        }
    }, [error]);

    if (isPending) {
        return null;
    }

    return isHydrated ? (
        <paypal-credit-button
            onClick={handleClick}
            countryCode={countryCode}
            disabled={disabled || !!error || undefined}
        ></paypal-credit-button>
    ) : (
        <div />
    );
};
