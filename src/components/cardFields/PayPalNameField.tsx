import React, { useEffect } from "react";

import { PayPalCardFieldsIndividualFieldOptions } from "../../types";
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
        const nameFieldContainer = document.getElementById("card-name-field");
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

    return <div id="card-name-field" />;
};
