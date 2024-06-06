import React from "react";

import { PayPalCardFieldsIndividualFieldOptions } from "../../types";
import { PayPalCardField } from "./PayPalCardField";

export const PayPalNumberField: React.FC<
    PayPalCardFieldsIndividualFieldOptions
> = (options) => {
    return <PayPalCardField fieldName="NumberField" {...options} />;
};
