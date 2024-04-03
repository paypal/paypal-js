import React, { useEffect } from "react";

import {
    PayPalCardFieldsIndividualField,
    PayPalCardFieldsIndividualFieldOptions,
} from "../../types";
import { usePayPalCardFieldsContext } from "./PayPalCardFieldsProvider";

export const PayPalExpiryField: React.FC<
    PayPalCardFieldsIndividualFieldOptions
> = ({ style, inputEvents, placeholder }) => {
    const { cardFields } = usePayPalCardFieldsContext();

    function close(field: PayPalCardFieldsIndividualField | null) {
        field
            ?.close()
            .then((err) => console.log({ err }))
            .catch(() => {
                // noop
            });
    }

    useEffect(() => {
        if (!cardFields) {
            return;
        }
        const expiryFieldContainer = document.getElementById(
            "paypal-expiry-field"
        );
        const expiryField = cardFields.ExpiryField({
            style,
            inputEvents,
            placeholder,
        });

        if (expiryFieldContainer) {
            expiryField.render(expiryFieldContainer);
        }
        return () => close(expiryField ?? null);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    return <div id="paypal-expiry-field" />;
};
