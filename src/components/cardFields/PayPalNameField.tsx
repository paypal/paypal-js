import React, { useEffect } from "react";

import { PayPalCardFieldsIndividualFieldOptions } from "../../types";
import { usePayPalCardFieldsContext } from "./PayPalCardFieldsProvider";

export const PayPalNameField: React.FC<
    PayPalCardFieldsIndividualFieldOptions
> = ({ style, inputEvents, placeholder }) => {
    const { cardFields } = usePayPalCardFieldsContext();

    useEffect(() => {
        const nameFieldContainer = document.getElementById("paypal-name-field");

        if (nameFieldContainer && cardFields) {
            const nameField = cardFields.NameField({
                style,
                inputEvents,
                placeholder,
            });

            nameField.render(nameFieldContainer);
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps
    return <div id="paypal-name-field" />;
};
