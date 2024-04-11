import React from "react";

import { usePayPalCardFields } from "./hooks";
import { PayPalCardFieldsIndividualFieldOptions } from "../../types";
import { PayPalCardField } from "./PayPalCardField";

export const PayPalCVVField: React.FC<
    PayPalCardFieldsIndividualFieldOptions
> = (options) => {
    const { cvvField } = usePayPalCardFields();

    return (
        <PayPalCardField
            fieldRef={cvvField}
            fieldName="CVVField"
            {...options}
        />
    );
};
