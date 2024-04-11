import React, { useEffect, useRef, useState } from "react";

import { usePayPalCardFields } from "./hooks";
import { hasChildren, ignore } from "./utils";
import { PayPalCardFieldsIndividualFieldOptions } from "../../types";

export const PayPalNameField: React.FC<
    PayPalCardFieldsIndividualFieldOptions
> = ({ className, ...options }) => {
    const { cardFields, nameField, registerField, unregisterField } =
        usePayPalCardFields();

    const nameContainer = useRef<HTMLDivElement>(null);

    // Set errors is state so that they can be caught by React's error boundary
    const [, setError] = useState(null);

    function closeComponent() {
        unregisterField("PayPalNameField");
        nameField.current?.close().catch(ignore);
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
        if (!nameContainer.current) {
            return closeComponent;
        }

        registerField("PayPalNameField");
        nameField.current = cardFields.NameField(options);

        nameField.current.render(nameContainer.current).catch((err) => {
            if (!hasChildren(nameContainer)) {
                // Component no longer in the DOM, we can safely ignore the error
                return;
            }
            // Component is still in the DOM
            setError(() => {
                throw new Error(
                    `Failed to render <PayPalNameField /> component. ${err}`
                );
            });
        });

        return closeComponent;
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    return <div ref={nameContainer} className={className} />;
};
