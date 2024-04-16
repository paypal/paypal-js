import React from "react";

// import { usePayPalCardFields } from "./hooks";
import { PayPalCardFieldsIndividualFieldOptions } from "../../types";
import { PayPalCardField } from "./PayPalCardField";

export const PayPalNameField: React.FC<
    PayPalCardFieldsIndividualFieldOptions
> = (options) => {
    // const { nameField } = usePayPalCardFields();

    return (
        <PayPalCardField
            // fieldRef={nameField}
            fieldName="NameField"
            {...options}
        />
    );
};
