import React, { useEffect, useRef, useState } from "react";

import { usePayPalCardFields } from "./hooks";
import { hasChildren, ignore } from "./utils";
import {
    PayPalCardFieldsIndividualField,
    PayPalCardFieldsIndividualFieldOptions,
} from "../../types";

export const PayPalCardField: React.FC<
    PayPalCardFieldsIndividualFieldOptions & {
        fieldRef: React.MutableRefObject<PayPalCardFieldsIndividualField | null>;
        fieldName: "NameField" | "NumberField" | "CVVField" | "ExpiryField";
    }
> = ({ className, fieldRef, fieldName, ...options }) => {
    const { cardFields, registerField, unregisterField } =
        usePayPalCardFields();

    const containerRef = useRef<HTMLDivElement>(null);

    // Set errors is state so that they can be caught by React's error boundary
    const [, setError] = useState(null);

    function closeComponent() {
        unregisterField(`PayPal${fieldName}`);
        fieldRef.current?.close().catch(ignore);
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
        if (!containerRef.current) {
            return closeComponent;
        }

        registerField(`PayPal${fieldName}`);
        fieldRef.current = cardFields[fieldName](options);

        fieldRef.current.render(containerRef.current).catch((err) => {
            if (!hasChildren(containerRef)) {
                // Component no longer in the DOM, we can safely ignore the error
                return;
            }
            // Component is still in the DOM
            setError(() => {
                throw new Error(
                    `Failed to render <PayPal${fieldName} /> component. ${err}`
                );
            });
        });

        return closeComponent;
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    return <div ref={containerRef} className={className} />;
};
