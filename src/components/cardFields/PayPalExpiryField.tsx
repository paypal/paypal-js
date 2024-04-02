import React, { useEffect } from "react";

import { PayPalCardFieldsIndividualFieldOptions } from "../../types";
import { usePayPalCardFieldsContext } from "./PayPalCardFieldsProvider";

export const PayPalExpiryField: React.FC<
    PayPalCardFieldsIndividualFieldOptions
> = ({ style, inputEvents, placeholder }) => {
    const { cardFields } = usePayPalCardFieldsContext();

    useEffect(() => {
        if (!cardFields) {
            console.log("card fields not available");
            return;
        }

        const expiryFieldContainer = document.getElementById(
            "paypal-expiry-field"
        );

        console.log({
            expiryFieldContainer,
            cardFields,
        });

        if (expiryFieldContainer && cardFields) {
            const expiryField = cardFields.ExpiryField({
                style,
                inputEvents,
                placeholder,
            });

            expiryField.render(expiryFieldContainer);
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps
    return <div id="paypal-expiry-field" />;
};
