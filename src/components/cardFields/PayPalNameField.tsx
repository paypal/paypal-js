import React, { useEffect } from "react";

import { type PayPalCardFieldsIndividualFieldOptions } from "../../types";
import { closeField } from "./utils";
import { usePayPalCardFields } from "./hooks";

export const PayPalNameField: React.FC<
    PayPalCardFieldsIndividualFieldOptions
> = ({ style, inputEvents, placeholder }) => {
    const { cardFields } = usePayPalCardFields();

    useEffect(() => {
        if (!cardFields) {
            return;
        }
        const nameFieldContainer = document.getElementById("card-name-field");
        const nameField = cardFields.NameField({
            style,
            inputEvents,
            placeholder,
        });

        if (nameFieldContainer) {
            nameField.render(nameFieldContainer);
        }

        return () => closeField(nameField, "card-name-field");
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    return <div id="card-name-field" />;
};
