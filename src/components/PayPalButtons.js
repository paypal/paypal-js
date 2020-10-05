import React, { useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { useScriptReducer } from "../ScriptContext";
/**
 * This `<PayPalButtons />` component renders the [Smart Payment Buttons](https://developer.paypal.com/docs/checkout/).
 * It relies on the `<PayPalScriptProvider />` parent component for managing state related to loading the JS SDK script.
 *
 * All the [Smart Payment Button integration features](https://developer.paypal.com/docs/checkout/integration-features/) can be configured using props.
 * For example, here's how you would use the `style` and `createOrder` options:
 *
 * ```jsx
 *     <PayPalButtons style={{ layout: "vertical" }} createOrder={(data, actions) => {}} />
 * ```
 */
export default function PayPalButtons(props) {
    const [{ isLoaded }] = useScriptReducer();
    const buttonsContainerRef = useRef(null);
    const buttons = useRef(null);

    useEffect(() => {
        if (isLoaded) {
            buttons.current = window.paypal.Buttons({ ...props });

            if (buttons.current.isEligible()) {
                buttons.current.render(buttonsContainerRef.current);
            }
        } else {
            // close the buttons when the script is reloaded
            if (buttons.current) {
                buttons.current.close();
            }
        }
        return () => {
            // close the buttons when the component unmounts
            if (buttons.current) {
                buttons.current.close();
            }
        };
    });

    return <div ref={buttonsContainerRef} />;
}

PayPalButtons.propTypes = {
    /**
     * Sets up the transaction. Called when the buyer clicks the PayPal button.
     */
    createOrder: PropTypes.func,
    /**
     * Deprecated, replaced by `createSubscription`.
     */
    createBillingAgreement: PropTypes.func,
    /**
     * Sets up a subscription. Called when the buyer clicks the PayPal button.
     */
    createSubscription: PropTypes.func,
    /**
     * The individual button to render. Use the `FUNDING` constant exported by this library to set this value. The full list can be found [here](https://developer.paypal.com/docs/checkout/integration-features/standalone-buttons/#complete-your-integration).
     */
    fundingSource: PropTypes.string,

    /**
     * Approved styling options for customizing layout, color, shape, and labels.
     */
    style: PropTypes.exact({
        color: PropTypes.string,
        height: PropTypes.number,
        label: PropTypes.string,
        layout: PropTypes.string,
        shape: PropTypes.string,
        tagline: PropTypes.bool,
    }),
    /**
     * The possible values for shippingPreference are:
     *
     *    * `"NO_SHIPPING"`- Redact shipping address fields from the PayPal pages.
     *    * `"GET_FROM_FILE"`- Use the buyer-selected shipping address.
     *    * `"SET_PROVIDED_ADDRESS"`- Use the merchant-provided address.
     */
    shippingPreference: PropTypes.oneOf([
        "GET_FROM_FILE",
        "NO_SHIPPING",
        "SET_PROVIDED_ADDRESS",
    ]),
    /**
     * Finalizes the transaction. Often used to show the buyer a [confirmation page](https://developer.paypal.com/docs/checkout/integration-features/confirmation-page/).
     */
    onApprove: PropTypes.func,
    /**
     * Called when the buyer cancels the transaction. Often used to show the buyer a [cancellation page](https://developer.paypal.com/docs/checkout/integration-features/cancellation-page/).
     */
    onCancel: PropTypes.func,
    /**
     * Called when the button is clicked. Often used for [validation](https://developer.paypal.com/docs/checkout/integration-features/validation/).
     */
    onClick: PropTypes.func,
    /**
     * Catch all for errors preventing buyer checkout. Often used to show the buyer an [error page](https://developer.paypal.com/docs/checkout/integration-features/handle-errors/).
     */
    onError: PropTypes.func,
    /**
     * Called when the button first renders.
     */
    onInit: PropTypes.func,
    /**
     * Called when the buyer changes their shipping address on PayPal.
     */
    onShippingChange: PropTypes.func,
};

PayPalButtons.defaultProps = {
    style: {},
    shippingPreference: "GET_FROM_FILE",
};
