import { createContext } from "react";

import {
    PayPalCardFieldsIndividualField,
    PayPalCardFieldsRef,
} from "../../types";

export type CardFieldsState = PayPalCardFieldsRef | null;
export type FieldState = PayPalCardFieldsIndividualField | null;

export type PayPalCardFieldsContextState = {
    cardFields: React.MutableRefObject<CardFieldsState>;
    nameField: React.MutableRefObject<FieldState>;
    numberField: React.MutableRefObject<FieldState>;
    cvvField: React.MutableRefObject<FieldState>;
    expiryField: React.MutableRefObject<FieldState>;
};

export const PayPalCardFieldsContext =
    createContext<PayPalCardFieldsContextState>({
        cardFields: { current: null },
        nameField: { current: null },
        numberField: { current: null },
        cvvField: { current: null },
        expiryField: { current: null },
    });
