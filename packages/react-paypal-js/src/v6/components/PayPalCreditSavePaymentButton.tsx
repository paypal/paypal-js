import React, { useEffect } from "react";

import { usePayPalCreditSavePaymentSession } from "../hooks/usePayPalCreditSavePaymentSession";
import { usePayPal } from "../hooks/usePayPal";

import type { UsePayPalCreditSavePaymentSessionProps } from "../hooks/usePayPalCreditSavePaymentSession";

export type PayPalCreditSavePaymentButtonProps =
    UsePayPalCreditSavePaymentSessionProps & {
        autoRedirect?: never;
        disabled?: boolean;
    };

/**
 * `PayPalCreditSavePaymentButton` is a button that provides a PayPal Credit save payment flow.
 *
 * The `countryCode` is automatically populated from the eligibility API response
 * (available via `usePayPal().eligiblePaymentMethods`). The button requires eligibility to be configured
 * in the parent `PayPalProvider`, using either the `useEligibleMethods` hook client-side or `useFetchEligibleMethods` server-side.
 *
 * Note, `autoRedirect` is not allowed because if given a `presentationMode` of `"redirect"` the button
 * would not be able to provide back `redirectURL` from `start`. Advanced integrations that need
 * `redirectURL` should use the {@link usePayPalCreditSavePaymentSession} hook directly.
 *
 * @example
 * <PayPalCreditSavePaymentButton
 *   onApprove={() => {
 *      // ... on approve logic
 *   }}
 *   vaultSetupToken="your-vault-setup-token"
 *   presentationMode="auto"
 * />
 */
export const PayPalCreditSavePaymentButton = ({
    disabled = false,
    ...hookProps
}: PayPalCreditSavePaymentButtonProps): JSX.Element | null => {
    const { eligiblePaymentMethods, isHydrated } = usePayPal();
    const { error, isPending, handleClick } =
        usePayPalCreditSavePaymentSession(hookProps);

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
