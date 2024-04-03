import { useContext } from "react";

import {
    PayPalCardFieldsContext,
    PayPalCardFieldsContextState,
} from "./context";

export const usePayPalCardFields = (): PayPalCardFieldsContextState =>
    useContext(PayPalCardFieldsContext);
