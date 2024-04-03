import React, { useEffect } from "react";

import { PayPalCardFieldsIndividualFieldOptions } from "../../types";
import { usePayPalCardFieldsContext } from "./PayPalCardFieldsProvider";
import { closeField } from "./utils";

export const PayPalCVVField: React.FC<
    PayPalCardFieldsIndividualFieldOptions
> = ({ style, inputEvents, placeholder }) => {
    const { cardFields } = usePayPalCardFieldsContext();

    useEffect(() => {
        if (!cardFields) {
            return;
        }

        const cvvFieldContainer = document.getElementById("card-cvv-field");
        const cvvField = cardFields.CVVField({
            style,
            inputEvents,
            placeholder,
        });

        console.log({ cvvField });

        if (cvvFieldContainer) {
            cvvField.render(cvvFieldContainer);
        }
        return () => closeField(cvvField ?? null);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    return <div id="card-cvv-field" />;
};
