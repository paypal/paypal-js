import React, { useEffect, useState } from "react";

import {
    PayPalCardFieldsIndividualField,
    PayPalCardFieldsIndividualFieldOptions,
} from "../../types";
import { usePayPalCardFieldsContext } from "./PayPalCardFieldsProvider";

export const PayPalCVVField: React.FC<
    PayPalCardFieldsIndividualFieldOptions
> = ({ style, inputEvents, placeholder }) => {
    const { cardFields } = usePayPalCardFieldsContext();
    const [cvvField, setCvvField] = useState<PayPalCardFieldsIndividualField>();

    useEffect(() => {
        const cvvFieldContainer = document.getElementById("paypal-cvv-field");
        console.log({
            cvvField,
        });
        if (cardFields && cvvField && cvvField.close) {
            cvvField.close().then(() => {
                setCvvField(() => {
                    const temp = cardFields?.CVVField();
                    if (cvvFieldContainer) {
                        temp?.render(cvvFieldContainer);
                    }
                    return temp;
                });
            });
        } else {
            setCvvField(() => {
                const temp = cardFields?.CVVField();
                if (cvvFieldContainer) {
                    temp?.render(cvvFieldContainer);
                }
                return temp;
            });
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps
    return <div id="paypal-cvv-field" />;
};
