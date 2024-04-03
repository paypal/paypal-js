import React, { useEffect } from "react";

import { PayPalCardFieldsIndividualFieldOptions } from "../../types";
import { usePayPalCardFieldsContext } from "./PayPalCardFieldsProvider";
import { closeField } from "./utils";

export const PayPalExpiryField: React.FC<
    PayPalCardFieldsIndividualFieldOptions
> = ({ style, inputEvents, placeholder }) => {
    const { cardFields } = usePayPalCardFieldsContext();

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
        return () => closeField(expiryField ?? null);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    return <div id="card-expiry-field" />;
};
