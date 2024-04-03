import React, { useEffect } from "react";

import { type PayPalCardFieldsIndividualFieldOptions } from "../../types";
import { closeField } from "./utils";
import { usePayPalCardFields } from "./hooks";

export const PayPalNumberField: React.FC<
    PayPalCardFieldsIndividualFieldOptions
> = ({ style, inputEvents, placeholder }) => {
    const { cardFields } = usePayPalCardFields();

    useEffect(() => {
        if (!cardFields) {
            return;
        }
        const numberFieldContainer =
            document.getElementById("card-number-field");

        const numberField = cardFields.NumberField({
            style,
            inputEvents,
            placeholder,
        });

        if (numberFieldContainer) {
            numberField.render(numberFieldContainer);
        }
        return () => closeField(numberField, "card-number-field");
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    return <div id="card-number-field" />;
};
