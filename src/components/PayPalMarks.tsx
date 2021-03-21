import React, { useEffect, useRef, useState, FunctionComponent } from "react";
import { usePayPalScriptReducer } from "../ScriptContext";
import { getPayPalWindowNamespace, DEFAULT_PAYPAL_NAMESPACE } from "./utils";
import type {
    PayPalMarksComponentProps,
    PayPalMarksComponent,
} from "@paypal/paypal-js/types/components/marks";

export interface PayPalMarksReactProps extends PayPalMarksComponentProps {
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
export const PayPalMarks: FunctionComponent<PayPalMarksReactProps> = ({
    className = "",
    ...markProps
}: PayPalMarksReactProps) => {
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

        const paypalWindowNamespace = getPayPalWindowNamespace(
            options["data-namespace"]
        );

        // verify dependency on window object
        if (
            paypalWindowNamespace === undefined ||
            paypalWindowNamespace.Marks === undefined
        ) {
            setErrorState(() => {
                throw new Error(getErrorMessage(options));
            });
            return;
        }

        mark.current = paypalWindowNamespace.Marks({ ...markProps });

        // only render the mark when eligible
        if (mark.current.isEligible() === false) {
            return;
        }

        if (markContainerRef.current === null) {
            return;
        }

        mark.current.render(markContainerRef.current).catch((err) => {
            // component failed to render, possibly because it was closed or destroyed.
            if (
                markContainerRef.current === null ||
                markContainerRef.current.children.length === 0
            ) {
                // paypal marks container is no longer in the DOM, we can safely ignore the error
                return;
            }
            // paypal marks container is still in the DOM
            setErrorState(() => {
                throw new Error(
                    `Failed to render <PayPalMarks /> component. ${err}`
                );
            });
        });
    }, [isResolved, markProps.fundingSource]);

    return <div ref={markContainerRef} className={className} />;
};

function getErrorMessage({
    components = "",
    "data-namespace": dataNamespace = DEFAULT_PAYPAL_NAMESPACE,
}) {
    let errorMessage = `Unable to render <PayPalMarks /> because window.${dataNamespace}.Marks is undefined.`;

    // the JS SDK does not load the Marks component by default. It must be passed into the "components" query parameter.
    if (!components.includes("marks")) {
        const expectedComponents = components ? `${components},marks` : "marks";

        errorMessage +=
            "\nTo fix the issue, add 'marks' to the list of components passed to the parent PayPalScriptProvider:" +
            `\n\`<PayPalScriptProvider options={{ components: '${expectedComponents}'}}>\`.`;
    }

    return errorMessage;
}
