import React, { useEffect } from "react";

import {
    PayPalCardFieldsIndividualField,
    PayPalCardFieldsIndividualFieldOptions,
} from "../../types";
import { usePayPalCardFieldsContext } from "./PayPalCardFieldsProvider";

export const PayPalCVVField: React.FC<
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
        const cvvFieldContainer = document.getElementById("paypal-cvv-field");
        const cvvField = cardFields.CVVField({
            style,
            inputEvents,
            placeholder,
        });

        if (cvvFieldContainer) {
            cvvField.render(cvvFieldContainer);
        }
        return () => close(cvvField ?? null);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    return <div id="paypal-cvv-field" />;
};
