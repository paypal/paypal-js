import React, { useEffect, useRef, useState } from "react";
import { usePayPalScriptReducer } from "../ScriptContext";
import type {
    PayPalMarksComponentProps,
    PayPalMarksComponent,
} from "@paypal/paypal-js/types/components/marks";

interface PayPalMarksReactProps extends PayPalMarksComponentProps {
    /**
     * Pass a css class to the div container.
     */
    className?: string;
}

/**
 * The `<PayPalMarks />` component is used for conditionally rendering different payment options using radio buttons.
 * The [Display PayPal Buttons with other Payment Methods guide](https://developer.paypal.com/docs/business/checkout/add-capabilities/buyer-experience/#display-paypal-buttons-with-other-payment-methods) describes this style of integration in detail.
 * It relies on the `<PayPalScriptProvider />` parent component for managing state related to loading the JS SDK script.
 *
 * ```jsx
 *     <PayPalMarks />
 * ```
 *
 * This component can also be configured to use a single funding source similar to the [standalone buttons](https://developer.paypal.com/docs/business/checkout/configure-payments/standalone-buttons/) approach.
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
export default function PayPalMarks({
    className = "",
    ...markProps
}: PayPalMarksReactProps) {
    const [{ isResolved, options }] = usePayPalScriptReducer();
    const markContainerRef = useRef<HTMLDivElement>(null);
    const mark = useRef<PayPalMarksComponent | null>(null);
    const [, setErrorState] = useState(null);

    useEffect(() => {
        // verify the sdk script has successfully loaded
        if (isResolved === false) {
            return;
        }

        // don't rerender when already rendered
        if (mark.current !== null) {
            return;
        }

        // verify dependency on window.paypal object
        if (window.paypal === undefined || window.paypal.Marks === undefined) {
            setErrorState(() => {
                throw new Error(getErrorMessage(options));
            });
            return;
        }

        mark.current = window.paypal.Marks({ ...markProps });

        // only render the mark when eligible
        if (mark.current.isEligible() === false) {
            return;
        }

        if (markContainerRef.current === null) {
            return;
        }

        mark.current.render(markContainerRef.current).catch((err) => {
            console.error(`Failed to render <PayPalMarks /> component. ${err}`);
        });
    }, [isResolved, markProps.fundingSource]);

    return <div ref={markContainerRef} className={className} />;
}

function getErrorMessage({ components = "" }) {
    let errorMessage =
        "Unable to render <PayPalMarks /> because window.paypal.Marks is undefined.";

    // the JS SDK does not load the Marks component by default. It must be passed into the "components" query parameter.
    if (!components.includes("marks")) {
        const expectedComponents = components ? `${components},marks` : "marks";

        errorMessage +=
            "\nTo fix the issue, add 'marks' to the list of components passed to the parent PayPalScriptProvider:" +
            `\n\`<PayPalScriptProvider options={{ components: '${expectedComponents}'}}>\`.`;
    }

    return errorMessage;
}
