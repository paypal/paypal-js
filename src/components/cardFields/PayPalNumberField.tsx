import React, { useEffect } from "react";

import {
    PayPalCardFieldsIndividualField,
    PayPalCardFieldsIndividualFieldOptions,
} from "../../types";
import { usePayPalCardFieldsContext } from "./PayPalCardFieldsProvider";

export const PayPalNumberField: React.FC<
    PayPalCardFieldsIndividualFieldOptions
> = ({ style, inputEvents, placeholder }) => {
    const { cardFields } = usePayPalCardFieldsContext();

    function close(field: PayPalCardFieldsIndividualField | null) {
        field?.close().catch(() => {
            // noop
        });
    }

    useEffect(() => {
        if (!cardFields) {
            return;
        }
        const numberFieldContainer = document.getElementById(
            "paypal-number-field"
        );
        const numberField = cardFields.NumberField({
            style,
            inputEvents,
            placeholder,
        });

        if (numberFieldContainer) {
            numberField.render(numberFieldContainer);
        }
        return () => close(numberField ?? null);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    return <div id="paypal-number-field" />;
};
