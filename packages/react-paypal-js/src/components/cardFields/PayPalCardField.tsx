import React, { useEffect, useRef, useState } from "react";

import { usePayPalCardFields } from "./hooks";
import { hasChildren } from "./utils";
import { CARD_FIELDS_CONTEXT_ERROR } from "../../constants";

import type {
    FieldComponentName,
    PayPalCardFieldsIndividualFieldOptions,
} from "../../types";

export const PayPalCardField: React.FC<
    PayPalCardFieldsIndividualFieldOptions & {
        fieldName: FieldComponentName;
    }
> = ({ className, fieldName, ...options }) => {
    const { cardFieldsForm, registerField, unregisterField } =
        usePayPalCardFields();

    const containerRef = useRef<HTMLDivElement>(null);

    // Set errors is state so that they can be caught by React's error boundary
    const [, setError] = useState(null);

    function closeComponent() {
        unregisterField(fieldName);
    }

    useEffect(() => {
        if (!cardFieldsForm) {
            setError(() => {
                throw new Error(CARD_FIELDS_CONTEXT_ERROR);
            });
            return closeComponent;
        }
        if (!containerRef.current) {
            return closeComponent;
        }

        const registeredField = registerField(
            fieldName,
            options,
            cardFieldsForm,
        );

        registeredField?.render(containerRef.current).catch((err) => {
            if (!hasChildren(containerRef)) {
                // Component no longer in the DOM, we can safely ignore the error
                return;
            }
            // Component is still in the DOM
            setError(() => {
                throw new Error(
                    `Failed to render <PayPal${fieldName} /> component. ${err}`,
                );
            });
        });

        return closeComponent;
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    return <div ref={containerRef} className={className} />;
};
