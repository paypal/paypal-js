import React from "react";

// import { usePayPalCardFields } from "./hooks";
import { PayPalCardFieldsIndividualFieldOptions } from "../../types";
import { PayPalCardField } from "./PayPalCardField";

export const PayPalNumberField: React.FC<
    PayPalCardFieldsIndividualFieldOptions
> = (options) => {
    // const { numberField } = usePayPalCardFields();

    return (
        <PayPalCardField
            // fieldRef={numberField}
            fieldName="NumberField"
            {...options}
        />
    );
};
