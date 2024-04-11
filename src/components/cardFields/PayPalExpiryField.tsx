import React from "react";

import { usePayPalCardFields } from "./hooks";
import { PayPalCardFieldsIndividualFieldOptions } from "../../types";
import { PayPalCardField } from "./PayPalCardField";

export const PayPalExpiryField: React.FC<
    PayPalCardFieldsIndividualFieldOptions
> = (options) => {
    const { expiryField } = usePayPalCardFields();

    return (
        <PayPalCardField
            fieldRef={expiryField}
            fieldName="ExpiryField"
            {...options}
        />
    );
};
