import { createContext } from "react";
import {
    PayPalCardFieldsComponent,
    PayPalCardFieldsIndividualField,
} from "@paypal/paypal-js/types/components/card-fields";

import { ignore } from "./utils";
import { FieldComponentName } from "./hooks";

export type PayPalCardFieldsContextType = {
    cardFields: PayPalCardFieldsComponent | null;
    nameField: React.MutableRefObject<PayPalCardFieldsIndividualField | null>;
    numberField: React.MutableRefObject<PayPalCardFieldsIndividualField | null>;
    expiryField: React.MutableRefObject<PayPalCardFieldsIndividualField | null>;
    cvvField: React.MutableRefObject<PayPalCardFieldsIndividualField | null>;
    registerField: (field: FieldComponentName) => void;
    unregisterField: (field: FieldComponentName) => void;
};

export const PayPalCardFieldsContext =
    createContext<PayPalCardFieldsContextType>({
        cardFields: null,
        nameField: { current: null },
        numberField: { current: null },
        cvvField: { current: null },
        expiryField: { current: null },
        registerField: ignore, // implementation is inside provider
        unregisterField: ignore, // implementation is inside provider
    });
