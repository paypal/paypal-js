import React from "react";

import { PayPalCardFieldsIndividualFieldOptions } from "../../types";
import { PayPalCardField } from "./PayPalCardField";

export const PayPalExpiryField: React.FC<
    PayPalCardFieldsIndividualFieldOptions
> = (options) => {
    return <PayPalCardField fieldName="ExpiryField" {...options} />;
};
