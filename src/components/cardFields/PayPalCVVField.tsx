import React, { useEffect, useRef, useState } from "react";

import { usePayPalCardFields } from "./hooks";
import { hasChildren, ignore } from "./utils";
import { PayPalCardFieldsIndividualFieldOptions } from "../../types";

export const PayPalCVVField: React.FC<
    PayPalCardFieldsIndividualFieldOptions
> = ({ className, ...options }) => {
    const { cardFields, cvvField, registerField, unregisterField } =
        usePayPalCardFields();

    const cvvContainer = useRef<HTMLDivElement>(null);

    // Set errors is state so that they can be caught by React's error boundary
    const [, setError] = useState(null);

    function closeComponent() {
        unregisterField("PayPalCVVField");
        cvvField.current?.close().catch(ignore);
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
        if (!cvvContainer.current) {
            return closeComponent;
        }

        registerField("PayPalCVVField");
        cvvField.current = cardFields.CVVField(options);

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

    return <div ref={cvvContainer} className={className} />;
};
