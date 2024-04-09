import React, { useEffect, useRef, useState } from "react";
import {
    PayPalCardFieldsIndividualField,
    PayPalCardFieldsIndividualFieldOptions,
} from "@paypal/paypal-js/types/components/card-fields";

import { usePayPalCardFields, usePayPalCardFieldsRenderState } from "./hooks";
import { hasChildren, ignore } from "./utils";

export const PayPalNumberField: React.FC<
    PayPalCardFieldsIndividualFieldOptions
> = (options) => {
    const { cardFields, numberField, numberContainer } = usePayPalCardFields();
    const { registerField, unregisterField } = usePayPalCardFieldsRenderState();

    // const numberContainer = useRef<HTMLDivElement>(null);
    // const numberField = useRef<PayPalCardFieldsIndividualField | null>(null);

    // Set errors is state so that they can be caught by React's error boundary
    const [, setError] = useState(null);

    function closeComponent() {
        unregisterField("PayPalNumberField");
        numberField.current?.close().catch(ignore);
    }

    useEffect(() => {
        if (!cardFields.current || !numberContainer.current) {
            return closeComponent;
        }
        registerField("PayPalNumberField");
        numberField.current = cardFields.current.NumberField(options);

        // Assigning current numberField to the globally available numberField in usePayPalCardFields() for merchants to interact with
        // globalNumberField.current = numberField.current;

        numberField.current.render(numberContainer.current).catch((err) => {
            if (!hasChildren(numberContainer)) {
                // Component no longer in the DOM, we can safely ignore the error
                return;
            }
            // Component is still in the DOM
            setError(() => {
                throw new Error(
                    `Failed to render <PayPalNumberField /> component. ${err}`
                );
            });
        });

        return closeComponent;
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    return <div ref={numberContainer} />;
};
