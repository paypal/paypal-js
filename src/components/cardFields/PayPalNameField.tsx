import React from "react";

import { PayPalCardFieldsIndividualFieldOptions } from "../../types";
import { PayPalCardField } from "./PayPalCardField";

export const PayPalNameField: React.FC<
    PayPalCardFieldsIndividualFieldOptions
> = (options) => {
    return (
        <PayPalCardField
            fieldName="NameField"
            {...options}
        />
    );
};
