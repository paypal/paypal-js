import React from "react";

import { PayPalCardFieldsIndividualFieldOptions } from "../../types";
import { PayPalCardField } from "./PayPalCardField";

export const PayPalCVVField: React.FC<
    PayPalCardFieldsIndividualFieldOptions
> = (options) => {
    return (
        <PayPalCardField
            fieldName="CVVField"
            {...options}
        />
    );
};
