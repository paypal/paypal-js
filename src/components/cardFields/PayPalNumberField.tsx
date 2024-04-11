import React, { useEffect, useRef, useState } from "react";

import { usePayPalCardFields } from "./hooks";
import { hasChildren, ignore } from "./utils";
import { PayPalCardFieldsIndividualFieldOptions } from "../../types";

export const PayPalNumberField: React.FC<
    PayPalCardFieldsIndividualFieldOptions
> = ({ className, ...options }) => {
    const { cardFields, numberField, registerField, unregisterField } =
        usePayPalCardFields();

    const numberContainer = useRef<HTMLDivElement>(null);

    // Set errors is state so that they can be caught by React's error boundary
    const [, setError] = useState(null);

    function closeComponent() {
        unregisterField("PayPalNumberField");
        numberField.current?.close().catch(ignore);
    }

    useEffect(() => {
        if (!cardFields) {
            setError(() => {
                throw new Error(
                    "Individual CardFields must be rendered inside the PayPalCardFieldsProvider"
                );
            });
            return closeComponent;
        }
        if (!numberContainer.current) {
            return closeComponent;
        }
        registerField("PayPalNumberField");
        numberField.current = cardFields.NumberField(options);

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

    return <div ref={numberContainer} className={className} />;
};
