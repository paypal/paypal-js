import React, { useEffect } from "react";

import { usePayLaterOneTimePaymentSession } from "../hooks/usePayLaterOneTimePaymentSession";
import { useEligibleMethods } from "../hooks/useEligibleMethods";
import { usePayPal } from "../hooks/usePayPal";

import type { UsePayLaterOneTimePaymentSessionProps } from "../hooks/usePayLaterOneTimePaymentSession";

type PayLaterOneTimePaymentButtonProps =
    UsePayLaterOneTimePaymentSessionProps & {
        autoRedirect?: never;
        disabled?: boolean;
    };

/**
 * `PayLaterOneTimePaymentButton` is a button that provides a PayLater payment flow.
 *
 * The `countryCode` and `productCode` are automatically populated from the eligibility API response
 * (available via `usePayPal().eligiblePaymentMethods`). The button requires eligibility to be configured
 * in the parent `PayPalProvider`.
 *
 * Note, `autoRedirect` is not allowed because if given a `presentationMode` of `"redirect"` the button
 * would not be able to provide back `redirectURL` from `start`. Advanced integrations that need
 * `redirectURL` should use the {@link usePayLaterOneTimePaymentSession} hook directly.
 *
 * @example
 * <PayLaterOneTimePaymentButton
 *   onApprove={() => {
 *      // ... on approve logic
 *   }}
 *   orderId="your-order-id"
 *   presentationMode="auto"
 * />
 */
export const PayLaterOneTimePaymentButton = ({
    disabled = false,
    ...hookProps
}: PayLaterOneTimePaymentButtonProps): JSX.Element | null => {
    const { isHydrated } = usePayPal();
    const { eligiblePaymentMethods, isLoading } = useEligibleMethods();
    const { error, isPending, handleClick } =
        usePayLaterOneTimePaymentSession(hookProps);

    const payLaterDetails = eligiblePaymentMethods?.getDetails("paylater");
    const countryCode = payLaterDetails?.countryCode;
    const productCode = payLaterDetails?.productCode;

    useEffect(() => {
        if (error) {
            console.error(error);
        }
    }, [error]);

    if (isPending || isLoading) {
        return null;
    }

    return isHydrated ? (
        <paypal-pay-later-button
            onClick={handleClick}
            countryCode={countryCode}
            productCode={productCode}
            disabled={disabled || !!error || undefined}
        ></paypal-pay-later-button>
    ) : (
        <div />
    );
};
