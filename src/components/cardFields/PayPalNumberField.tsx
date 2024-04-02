import React, { useEffect } from "react";

import { PayPalCardFieldsIndividualFieldOptions } from "../../types";
import { usePayPalCardFieldsContext } from "./PayPalCardFieldsProvider";

export const PayPalNumberField: React.FC<
    PayPalCardFieldsIndividualFieldOptions
> = ({ style, inputEvents, placeholder }) => {
    const { cardFields } = usePayPalCardFieldsContext();

    useEffect(() => {
        const numberFieldContainer = document.getElementById(
            "paypal-number-field"
        );

        if (numberFieldContainer && cardFields) {
            const numberField = cardFields.NumberField({
                style,
                inputEvents,
                placeholder,
            });

            numberField.render(numberFieldContainer);
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps
    return <div id="paypal-number-field" />;
};
