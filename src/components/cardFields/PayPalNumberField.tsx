import React, { useEffect } from "react";

import { PayPalCardFieldsIndividualFieldOptions } from "../../types";
import { usePayPalCardFieldsContext } from "./PayPalCardFieldsProvider";
import { closeField } from "./utils";

export const PayPalNumberField: React.FC<
    PayPalCardFieldsIndividualFieldOptions
> = ({ style, inputEvents, placeholder }) => {
    const { cardFields } = usePayPalCardFieldsContext();

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
        return () => closeField(numberField ?? null);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    return <div id="card-number-field" />;
};
