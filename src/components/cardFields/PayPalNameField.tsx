import React, { useEffect, useRef, useState } from "react";
import { PayPalCardFieldsIndividualFieldOptions } from "@paypal/paypal-js/types/components/card-fields";

import { usePayPalCardFields } from "./hooks";
import { hasChildren, ignore } from "./utils";

export const PayPalNameField: React.FC<
    PayPalCardFieldsIndividualFieldOptions
> = (options) => {
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
        if (!cardFields.current || !nameContainer.current) {
            return closeComponent;
        }

        registerField("PayPalNameField");
        nameField.current = cardFields.current.NameField(options);

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

    return <div ref={nameContainer} />;
};
