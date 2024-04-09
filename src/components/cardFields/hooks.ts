import { useContext } from "react";

import {
    PayPalCardFieldsContext,
    PayPalCardFieldsContextType,
    PayPalCardFieldsRenderStateContext,
    PayPalCardFieldsRenderStateContextType,
} from "./context";

export const usePayPalCardFields = (): PayPalCardFieldsContextType =>
    useContext(PayPalCardFieldsContext);
export const usePayPalCardFieldsRenderState =
    (): PayPalCardFieldsRenderStateContextType =>
        useContext(PayPalCardFieldsRenderStateContext);
