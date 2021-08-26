import type { BraintreePayPalCheckout } from "../../types/braintree/paypalCheckout";
import type {
    PayPalButtonsComponentProps,
    BraintreePayPalButtonsComponentProps,
} from "../../types";

/**
 * Override the createOrder callback to send the PayPal checkout instance as argument
 * to the defined createOrder function for braintree component button
 *
 * @param braintreeButtonProps the component button options
 */
const decorateCreateOrder = (
    braintreeButtonProps: BraintreePayPalButtonsComponentProps,
    payPalCheckoutInstance: BraintreePayPalCheckout
) => {
    if (typeof braintreeButtonProps.createOrder === "function") {
        // Keep the createOrder function reference
        const functionReference = braintreeButtonProps.createOrder;

        braintreeButtonProps.createOrder = (data, actions) =>
            functionReference(data, {
                ...actions,
                braintree: payPalCheckoutInstance,
            });
    }
};

/**
 * Override the onApprove callback to send the payload as argument
 * to the defined onApprove function for braintree component button
 *
 * @param braintreeButtonProps the component button options
 */
const decorateOnApprove = (
    braintreeButtonProps: BraintreePayPalButtonsComponentProps,
    payPalCheckoutInstance: BraintreePayPalCheckout
) => {
    if (typeof braintreeButtonProps.onApprove === "function") {
        // Store the createOrder function reference
        const braintreeOnApprove = braintreeButtonProps.onApprove;

        braintreeButtonProps.onApprove = (data, actions) =>
            braintreeOnApprove(data, {
                ...actions,
                braintree: payPalCheckoutInstance,
            });
    }
};

/**
 * Use `actions.braintree` to provide an interface for the paypalCheckoutInstance
 * through the createOrder and onApprove callbacks
 *
 * @param braintreeButtonProps the component button options
 * @returns a new copy of the component button options casted as {@link PayPalButtonsComponentProps}
 */
export const decorateActions = (
    buttonProps: BraintreePayPalButtonsComponentProps,
    payPalCheckoutInstance: BraintreePayPalCheckout
): PayPalButtonsComponentProps => {
    decorateCreateOrder(buttonProps, payPalCheckoutInstance);
    decorateOnApprove(buttonProps, payPalCheckoutInstance);

    return { ...buttonProps } as PayPalButtonsComponentProps;
};
