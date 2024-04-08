import React, { useEffect, useRef, useState } from "react";

import { type PayPalCardFieldsIndividualFieldOptions } from "../../types";
import { usePayPalCardFields } from "./hooks";
import { ignore } from "./utils";

export const PayPalNameField: React.FC<
    PayPalCardFieldsIndividualFieldOptions
> = (options) => {
    const { cardFields, nameField } = usePayPalCardFields();

    const nameContainer = useRef<HTMLDivElement>(null);

    // We set the error inside state so that it can be caught by React's error boundary
    const [, setError] = useState(null);

    function closeComponent() {
        nameField.current?.close().catch(ignore);
    }

    useEffect(() => {
        if (!cardFields.current || !nameContainer.current) {
            return closeComponent;
        }

        nameField.current = cardFields.current.NameField(options);
        nameField.current.render(nameContainer.current).catch((err) => {
            const nameIsRendered = !!nameContainer.current?.children.length;
            if (!nameIsRendered) {
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
