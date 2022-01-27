import { loadCustomScript } from "@paypal/paypal-js";

import { getBraintreeWindowNamespace } from "../../utils";
import {
    BRAINTREE_SOURCE,
    BRAINTREE_PAYPAL_CHECKOUT_SOURCE,
} from "../../constants";

import type { BraintreeNamespace } from "./../../types/braintreePayPalButtonTypes";
import type { BraintreePayPalCheckout } from "../../types/braintree/paypalCheckout";
import type { BraintreePayPalButtonsComponentProps } from "../../types";

/**
 * Simple check to determine if the Braintree is a valid namespace.
 *
 * @param braintreeSource the source {@link BraintreeNamespace}
 * @returns a boolean representing if the namespace is valid.
 */
const isValidBraintreeNamespace = (braintreeSource?: BraintreeNamespace) => {
    if (
        typeof braintreeSource?.client?.create !== "function" &&
        typeof braintreeSource?.paypalCheckout?.create !== "function"
    ) {
        throw new Error(
            "The braintreeNamespace property is not a valid BraintreeNamespace type."
        );
    }
    return true;
};

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
/**
 * Get the Braintree namespace from the component props.
 * If the prop `braintreeNamespace` is undefined will try to load it from the CDN.
 * This function allows users to set the braintree manually on the `BraintreePayPalButtons` component.
 *
 * Use case can be for example legacy sites using AMD/UMD modules,
 * trying to integrate the `BraintreePayPalButtons` component.
 * If we attempt to load the Braintree from the CDN won't define the braintree namespace.
 * This happens because the braintree script is an UMD module.
 * After detecting the AMD on the global scope will create an anonymous module using `define`
 * and the `BraintreePayPalButtons` won't be able to get access to the `window.braintree` namespace
 * from the global context.
 *
 * @param braintreeSource the source {@link BraintreeNamespace}
 * @returns the {@link BraintreeNamespace}
 */
export const getBraintreeNamespace = (
    braintreeSource?: BraintreeNamespace
): Promise<BraintreeNamespace> => {
    if (braintreeSource && isValidBraintreeNamespace(braintreeSource)) {
        return Promise.resolve(braintreeSource);
    }

    return Promise.all([
        loadCustomScript({ url: BRAINTREE_SOURCE }),
        loadCustomScript({ url: BRAINTREE_PAYPAL_CHECKOUT_SOURCE }),
    ]).then(() => getBraintreeWindowNamespace());
};
