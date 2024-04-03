import React, { useEffect } from "react";

import {
    PayPalCardFieldsIndividualField,
    PayPalCardFieldsIndividualFieldOptions,
} from "../../types";
import { usePayPalCardFieldsContext } from "./PayPalCardFieldsProvider";
import { closeField } from "./utils";

export const PayPalNameField: React.FC<
    PayPalCardFieldsIndividualFieldOptions
> = ({ style, inputEvents, placeholder }) => {
    const { cardFields } = usePayPalCardFieldsContext();

    useEffect(() => {
        if (!cardFields) {
            return;
        }
        const nameFieldContainer = document.getElementById("paypal-name-field");
        const nameField = cardFields.NameField({
            style,
            inputEvents,
            placeholder,
        });

        if (nameFieldContainer) {
            nameField.render(nameFieldContainer);
        }

        console.log({ nameField });
        return () => closeField(nameField ?? null);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    return <div id="paypal-name-field" />;
};
