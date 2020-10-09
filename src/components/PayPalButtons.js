import React, { useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { usePayPalScriptReducer } from "../ScriptContext";
/**
 * This `<PayPalButtons />` component renders the [Smart Payment Buttons](https://developer.paypal.com/docs/business/javascript-sdk/javascript-sdk-reference/#buttons).
 * It relies on the `<PayPalScriptProvider />` parent component for managing state related to loading the JS SDK script.
 *
 * Use props for customizing your buttons. For example, here's how you would use the `style` and `createOrder` options:
 *
 * ```jsx
 *     <PayPalButtons style={{ layout: "vertical" }} createOrder={(data, actions) => {}} />
 * ```
 */
export default function PayPalButtons(props) {
    const [{ isLoaded, options }] = usePayPalScriptReducer();
    const buttonsContainerRef = useRef(null);
    const buttons = useRef(null);

    useEffect(() => {
        if (isLoaded) {
            verifyGlobalStateForButtons(options);

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

function verifyGlobalStateForButtons({ components = "" }) {
    if (typeof window.paypal.Buttons !== "undefined") {
        return;
    }

    let errorMessage =
        "Unable to render <PayPalButtons /> because window.paypal.Buttons is undefined.";

    // the JS SDK includes the Buttons component by default when no 'components' are specified.
    // The 'buttons' component must be included in the 'components' list when using it with other components.
    if (components.length && !components.includes("buttons")) {
        const expectedComponents = `${components},buttons`;

        errorMessage +=
            "\nTo fix the issue, add 'buttons' to the list of components passed to the parent PayPalScriptProvider:" +
            `\n\`<PayPalScriptProvider options={{ components: '${expectedComponents}'}}>\`.`;
    }
    throw new Error(errorMessage);
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
     * The individual button to render. Use the `FUNDING` constant exported by this library to set this value.
     * View the [list of available funding sources](https://developer.paypal.com/docs/business/checkout/configure-payments/standalone-buttons/#funding-sources) for more info.
     */
    fundingSource: PropTypes.string,

    /**
     * [Styling options](https://developer.paypal.com/docs/business/checkout/reference/style-guide/#customize-the-payment-buttons) for customizing layout, color, shape, and labels.
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
     * Called when the buyer cancels the transaction.
     * Often used to show the buyer a [cancellation page](https://developer.paypal.com/docs/business/checkout/add-capabilities/buyer-experience/#show-a-cancellation-page).
     */
    onCancel: PropTypes.func,
    /**
     * Called when the button is clicked. Often used for [validation](https://developer.paypal.com/docs/checkout/integration-features/validation/).
     */
    onClick: PropTypes.func,
    /**
     * Catch all for errors preventing buyer checkout.
     * Often used to show the buyer an [error page](https://developer.paypal.com/docs/checkout/integration-features/handle-errors/).
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
