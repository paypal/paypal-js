import React, { useEffect, useRef, useState } from "react";

import { type PayPalCardFieldsIndividualFieldOptions } from "../../types";
import { usePayPalCardFields } from "./hooks";
import { ignore } from "./utils";

export const PayPalCVVField: React.FC<
    PayPalCardFieldsIndividualFieldOptions
> = (options) => {
    const { cardFields, cvvField } = usePayPalCardFields();

    const cvvContainer = useRef<HTMLDivElement>(null);
    // const cvvRef = useRef<PayPalCardFieldsIndividualField | null>(null);

    // We set the error inside state so that it can be caught by React's error boundary
    const [, setError] = useState(null);

    function closeComponent() {
        cvvField.current?.close().catch(ignore);
    }

    useEffect(() => {
        if (!cardFields.current || !cvvContainer.current) {
            return closeComponent;
        }

        cvvField.current = cardFields.current.CVVField(options);

        cvvField.current.render(cvvContainer.current).catch((err) => {
            // component failed to render, possibly because it was closed or destroyed.
            const cvvIsRendered = !!cvvContainer.current?.children.length;
            if (!cvvIsRendered) {
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

    return <div ref={cvvContainer} />;
};
