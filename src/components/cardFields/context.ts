import { createContext } from "react";

import { PayPalCardFieldsIndividualField, PayPalCardFields } from "../../types";

export type PayPalCardFieldsContextState = {
    cardFields: React.MutableRefObject<PayPalCardFields | null>;
    nameField: React.MutableRefObject<PayPalCardFieldsIndividualField | null>;
    numberField: React.MutableRefObject<PayPalCardFieldsIndividualField | null>;
    cvvField: React.MutableRefObject<PayPalCardFieldsIndividualField | null>;
    expiryField: React.MutableRefObject<PayPalCardFieldsIndividualField | null>;
};

export const PayPalCardFieldsContext =
    createContext<PayPalCardFieldsContextState>({
        cardFields: { current: null },
        nameField: { current: null },
        numberField: { current: null },
        cvvField: { current: null },
        expiryField: { current: null },
    });
