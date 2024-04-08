import React, { useEffect, useRef, useState } from "react";

import { type PayPalCardFieldsIndividualFieldOptions } from "../../types";
import { usePayPalCardFields } from "./hooks";
import { ignore } from "./utils";

export const PayPalNumberField: React.FC<
    PayPalCardFieldsIndividualFieldOptions
> = (options) => {
    const { cardFields, numberField } = usePayPalCardFields();

    const numberContainer = useRef<HTMLDivElement>(null);

    // We set the error inside state so that it can be caught by React's error boundary
    const [, setError] = useState(null);

    function closeComponent() {
        numberField.current?.close().catch(ignore);
    }

    useEffect(() => {
        if (!cardFields.current || !numberContainer.current) {
            return closeComponent;
        }

        numberField.current = cardFields.current.NumberField(options);
        numberField.current.render(numberContainer.current).catch((err) => {
            const numberIsRendered = !!numberContainer.current?.children.length;
            if (!numberIsRendered) {
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
