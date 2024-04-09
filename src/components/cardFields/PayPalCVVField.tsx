import React, { useEffect, useRef, useState } from "react";
import {
    PayPalCardFieldsIndividualField,
    PayPalCardFieldsIndividualFieldOptions,
} from "@paypal/paypal-js/types/components/card-fields";

import { usePayPalCardFields, usePayPalCardFieldsRenderState } from "./hooks";
import { hasChildren, ignore } from "./utils";

export const PayPalCVVField: React.FC<
    PayPalCardFieldsIndividualFieldOptions
> = (options) => {
    const { cardFields, cvvField, cvvContainer } = usePayPalCardFields();
    const { registerField, unregisterField } = usePayPalCardFieldsRenderState();

    // const cvvContainer = useRef<HTMLDivElement>(null);
    // const cvvField = useRef<PayPalCardFieldsIndividualField | null>(null);

    // Set errors is state so that they can be caught by React's error boundary
    const [, setError] = useState(null);

    function closeComponent() {
        unregisterField("PayPalCVVField");
        cvvField.current?.close().catch(ignore);
    }

    useEffect(() => {
        if (!cardFields.current || !cvvContainer.current) {
            return closeComponent;
        }

        registerField("PayPalCVVField");
        cvvField.current = cardFields.current.CVVField(options);

        // Assigning current cvvField to the globally available cvvField in usePayPalCardFields() for merchants to interact with
        // globalCvvField.current = cvvField.current;

        cvvField.current.render(cvvContainer.current).catch((err) => {
            if (!hasChildren(cvvContainer)) {
                // Component no longer in the DOM, we can safely ignore the error
                return;
            }
            // Component is still in the DOM
            setError(() => {
                throw new Error(
                    `Failed to render <PayPalCVVField /> component. ${err}`
                );
            });
        });

        return closeComponent;
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    return <div ref={cvvContainer} />;
};
