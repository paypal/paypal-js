import type { BraintreePayPalCheckout } from "../../types/braintree/paypalCheckout";
import type { BraintreePayPalButtonsComponentProps } from "../../types";

/**
 * Use `actions.braintree` to provide an interface for the paypalCheckoutInstance
 * through the createOrder, createBillingAgreement and onApprove callbacks
 *
 * @param braintreeButtonProps the component button options
 * @returns a new copy of the component button options casted as {@link PayPalButtonsComponentProps}
 */
export const decorateActions = (
    buttonProps: BraintreePayPalButtonsComponentProps,
    payPalCheckoutInstance: BraintreePayPalCheckout
): BraintreePayPalButtonsComponentProps => {
    const createOrderRef = buttonProps.createOrder;
    const createBillingAgreementRef = buttonProps.createBillingAgreement;
    const onApproveRef = buttonProps.onApprove;

    if (typeof createOrderRef === "function") {
        buttonProps.createOrder = (data, actions) =>
            createOrderRef(data, {
                ...actions,
                braintree: payPalCheckoutInstance,
            });
    }

    if (typeof createBillingAgreementRef === "function") {
        buttonProps.createBillingAgreement = (data, actions) =>
            createBillingAgreementRef(data, {
                ...actions,
                braintree: payPalCheckoutInstance,
            });
    }

    if (typeof onApproveRef === "function") {
        buttonProps.onApprove = (data, actions) =>
            onApproveRef(data, {
                ...actions,
                braintree: payPalCheckoutInstance,
            });
    }

    return { ...buttonProps };
};
