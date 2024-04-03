import React, { useEffect } from "react";

import { type PayPalCardFieldsIndividualFieldOptions } from "../../types";
import { closeField } from "./utils";
import { usePayPalCardFields } from "./hooks";

export const PayPalExpiryField: React.FC<
    PayPalCardFieldsIndividualFieldOptions
> = ({ style, inputEvents, placeholder }) => {
    const { cardFields } = usePayPalCardFields();

    useEffect(() => {
        if (!cardFields) {
            return;
        }
        const expiryFieldContainer =
            document.getElementById("card-expiry-field");
        const expiryField = cardFields.ExpiryField({
            style,
            inputEvents,
            placeholder,
        });

        if (expiryFieldContainer) {
            expiryField.render(expiryFieldContainer);
        }
        return () => closeField(expiryField, "card-expiry-field");
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    return <div id="card-expiry-field" />;
};
