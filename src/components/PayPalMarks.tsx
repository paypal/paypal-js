import React, { useEffect, useRef, useState, FC, ReactNode } from "react";
import { usePayPalScriptReducer } from "../hooks/scriptProviderHooks";
import { getPayPalWindowNamespace, generateErrorMessage } from "../utils";
import { DATA_NAMESPACE } from "../constants";
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

This component can also be configured to use a single funding source similar to the [standalone buttons](https://developer.paypal.com/docs/business/checkout/configure-payments/standalone-buttons/) approach.
A `FUNDING` object is exported by this library which has a key for every available funding source option.
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
            return setErrorState(() => {
                throw new Error(
                    generateErrorMessage({
                        reactComponentName: PayPalMarks.displayName as string,
                        sdkComponentKey: "marks",
                        sdkRequestedComponents: options.components,
                        sdkDataNamespace: options[DATA_NAMESPACE],
                    })
                );
            });
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

PayPalMarks.displayName = "PayPalMarks";
