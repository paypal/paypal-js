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
 * This component can also be configured to use a single funding source similar to the [standalone buttons](https://developer.paypal.com/docs/checkout/integration-features/standalone-buttons/) approach.
 * A `FUNDING` object is exported by this library which has a key for every available funding source option.
 *
 * ```js
 *     import { FUNDING } from '@paypal/react-paypal-js'
 * ```
 *
 * Use this `FUNDING` constant to set the `fundingSource` prop.
 *
 * ```jsx
 *     <PayPalMarks fundingSource={FUNDING.PAYPAL}/>
 * ```
 */
export default function Marks(props) {
    const [{ isLoaded }] = useScriptReducer();
    const markContainerRef = useRef(null);
    const mark = useRef(null);

    useEffect(() => {
        if (isLoaded && !mark.current) {
            mark.current = window.paypal.Marks({ ...props });

            if (mark.current.isEligible()) {
                mark.current.render(markContainerRef.current);
            }
        }
    });

    return <div ref={markContainerRef} />;
}

Marks.propTypes = {
    /**
     * The individual mark to render. Use the `FUNDING` constant exported by this library to set this value. The full list can be found [here](https://developer.paypal.com/docs/checkout/integration-features/standalone-buttons/#complete-your-integration).
     */
    fundingSource: PropTypes.string,
};
