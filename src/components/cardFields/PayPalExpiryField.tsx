import React, { useEffect, useRef, useState } from "react";
import {
    PayPalCardFieldsIndividualField,
    PayPalCardFieldsIndividualFieldOptions,
} from "@paypal/paypal-js/types/components/card-fields";

import { usePayPalCardFields, usePayPalCardFieldsRenderState } from "./hooks";
import { hasChildren, ignore } from "./utils";

export const PayPalExpiryField: React.FC<
    PayPalCardFieldsIndividualFieldOptions
> = (options) => {
    const { cardFields, expiryField, expiryContainer } = usePayPalCardFields();
    const { registerField, unregisterField } = usePayPalCardFieldsRenderState();

    // const expiryContainer = useRef<HTMLDivElement>(null);
    // const expiryField = useRef<PayPalCardFieldsIndividualField | null>(null);

    // Set errors is state so that they can be caught by React's error boundary
    const [, setError] = useState(null);

    function closeComponent() {
        unregisterField("PayPalExpiryField");
        expiryField.current?.close().catch(ignore);
    }

    useEffect(() => {
        if (!cardFields.current || !expiryContainer.current) {
            return closeComponent;
        }

        registerField("PayPalExpiryField");
        expiryField.current = cardFields.current.ExpiryField(options);

        // Assigning current expiryField to the globally available expiryField in usePayPalCardFields() for merchants to interact with
        // globalExpiryField.current = expiryField.current;

        expiryField.current.render(expiryContainer.current).catch((err) => {
            if (!hasChildren(expiryContainer)) {
                // Component no longer in the DOM, we can safely ignore the error
                return;
            }
            // Component is still in the DOM
            setError(() => {
                throw new Error(
                    `Failed to render <PayPalExpiryField /> component. ${err}`
                );
            });
        });

        return closeComponent;
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    return <div ref={expiryContainer} />;
};
