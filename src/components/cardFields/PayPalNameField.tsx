import React, { useEffect, useRef, useState } from "react";
import {
    PayPalCardFieldsIndividualField,
    PayPalCardFieldsIndividualFieldOptions,
} from "@paypal/paypal-js/types/components/card-fields";

import { usePayPalCardFields } from "./hooks";
import { hasChildren, ignore } from "./utils";

export const PayPalNameField: React.FC<
    PayPalCardFieldsIndividualFieldOptions
> = (options) => {
    const { cardFields, nameField, nameContainer } = usePayPalCardFields();

    // const nameContainer = useRef<HTMLDivElement>(null);
    // const nameField = useRef<PayPalCardFieldsIndividualField | null>(null);

    // Set errors is state so that they can be caught by React's error boundary
    const [, setError] = useState(null);

    function closeComponent() {
        nameField.current?.close().catch(ignore);
    }

    useEffect(() => {
        if (!cardFields.current || !nameContainer.current) {
            return closeComponent;
        }

        nameField.current = cardFields.current.NameField(options);

        // Assigning current nameField to the globally available nameField in usePayPalCardFields() for merchants to interact with
        // globalNameField.current = nameField.current;

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
