import React, { useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { useScriptReducer } from "../ScriptContext";
/**
 * The `<PayPalMarks />` component is used for conditionally rendering different payment options using radio buttons. The [Using Radio Buttons](https://developer.paypal.com/docs/checkout/integration-features/mark-flow/) guide describes this style of integration in detail.
 * It relies on the `<PayPalScriptProvider />` parent component for managing state related to loading the JS SDK script.
 *
 * ```jsx
 *     <PayPalMarks />
 * ```
 *
 * It can also be configured to use a single funding source similar to the [standalone buttons](https://developer.paypal.com/docs/checkout/integration-features/standalone-buttons/) approach using the `fundingSource` prop.
 *
 * ```jsx
 *     <PayPalMarks fundingSource="paypal"/>
 * ```
 */
export default function Marks({ fundingSource }) {
    const [{ isLoaded }] = useScriptReducer();
    const markContainerRef = useRef(null);
    const mark = useRef(null);

    useEffect(() => {
        if (isLoaded && !mark.current) {
            mark.current = window.paypal.Marks({
                fundingSource: fundingSource,
            });

            if (mark.current.isEligible()) {
                mark.current.render(markContainerRef.current);
            }
        }
    });

    return <div ref={markContainerRef} />;
}

Marks.propTypes = {
    /**
     * The individual mark to render. The full list can be found [here](https://developer.paypal.com/docs/checkout/integration-features/standalone-buttons/#complete-your-integration).
     */
    fundingSource: PropTypes.string,
};
