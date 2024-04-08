import React, { useEffect, useRef, useState } from "react";

import { type PayPalCardFieldsIndividualFieldOptions } from "../../types";
import { usePayPalCardFields } from "./hooks";
import { ignore } from "./utils";

export const PayPalExpiryField: React.FC<
    PayPalCardFieldsIndividualFieldOptions
> = (options) => {
    const { cardFields, expiryField } = usePayPalCardFields();

    const expiryContainer = useRef<HTMLDivElement>(null);

    // We set the error inside state so that it can be caught by React's error boundary
    const [, setError] = useState(null);

    function closeComponent() {
        expiryField.current?.close().catch(ignore);
    }

    useEffect(() => {
        if (!cardFields.current || !expiryContainer.current) {
            return closeComponent;
        }

        expiryField.current = cardFields.current.ExpiryField(options);
        expiryField.current.render(expiryContainer.current).catch((err) => {
            const expiryIsRendered = !!expiryContainer.current?.children.length;
            if (!expiryIsRendered) {
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
