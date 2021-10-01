import React, { useEffect, useRef, useState, FC, ReactNode } from "react";
import { usePayPalScriptReducer } from "../hooks/scriptProviderHooks";
import { getPayPalWindowNamespace } from "../utils";
import { DEFAULT_PAYPAL_NAMESPACE, DATA_NAMESPACE } from "../constants";
import type {
    PayPalMarksComponentOptions,
    PayPalMarksComponent,
} from "@paypal/paypal-js/types/components/marks";

export interface PayPalMarksComponentProps extends PayPalMarksComponentOptions {
    /**
     * Pass a css class to the div container.
     */
    className?: string;
    children?: ReactNode;
}

/**
The `<PayPalMarks />` component is used for conditionally rendering different payment options using radio buttons.
The [Display PayPal Buttons with other Payment Methods guide](https://developer.paypal.com/docs/business/checkout/add-capabilities/buyer-experience/#display-paypal-buttons-with-other-payment-methods) describes this style of integration in detail.
It relies on the `<PayPalScriptProvider />` parent component for managing state related to loading the JS SDK script.
```jsx
    <PayPalMarks />
```
This component can also be configured to use a single funding source similar to the [standalone buttons](https://developer.paypal.com/docs/business/checkout/configure-payments/standalone-buttons/) approach.
A `FUNDING` object is exported by this library which has a key for every available funding source option.
```jsx
    import { PayPalScriptProvider, PayPalMarks, FUNDING } from "@paypal/react-paypal-js";
    <PayPalScriptProvider options={{ "client-id": "test", components: "buttons,marks" }}>
        <PayPalMarks fundingSource={FUNDING.PAYPAL}/>
    </PayPalScriptProvider>
```
*/
export const PayPalMarks: FC<PayPalMarksComponentProps> = ({
    className = "",
    children,
    ...markProps
}: PayPalMarksComponentProps) => {
    const [{ isResolved, options }] = usePayPalScriptReducer();
    const markContainerRef = useRef<HTMLDivElement>(null);
    const [isEligible, setIsEligible] = useState(true);
    const [, setErrorState] = useState(null);

    /**
     * Render PayPal Mark into the DOM
     */
    const renderPayPalMark = (mark: PayPalMarksComponent) => {
        const { current } = markContainerRef;

        // only render the mark when eligible
        if (!current || !mark.isEligible()) {
            return setIsEligible(false);
        }
        // Remove any children before render it again
        if (current.firstChild) {
            current.removeChild(current.firstChild);
        }

        mark.render(current).catch((err) => {
            // component failed to render, possibly because it was closed or destroyed.
            if (current === null || current.children.length === 0) {
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
    };

    useEffect(() => {
        // verify the sdk script has successfully loaded
        if (isResolved === false) return;

        const paypalWindowNamespace = getPayPalWindowNamespace(
            options[DATA_NAMESPACE]
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

        renderPayPalMark(paypalWindowNamespace.Marks({ ...markProps }));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isResolved, markProps.fundingSource]);

    return (
        <>
            {isEligible ? (
                <div ref={markContainerRef} className={className} />
            ) : (
                children
            )}
        </>
    );
};

function getErrorMessage({
    components = "",
    [DATA_NAMESPACE]: dataNamespace = DEFAULT_PAYPAL_NAMESPACE,
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
