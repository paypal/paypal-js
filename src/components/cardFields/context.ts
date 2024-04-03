import { createContext } from "react";

import { PayPalCardFieldsRef } from "../../types";

export type PayPalCardFieldsContextState = {
    cardFields: PayPalCardFieldsRef | null;
};

export const PayPalCardFieldsContext =
    createContext<PayPalCardFieldsContextState>({
        cardFields: null,
    });
