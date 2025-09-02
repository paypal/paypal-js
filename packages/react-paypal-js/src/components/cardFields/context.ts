import { createContext } from "react";

import { ignore } from "./utils";
import { RegistryHookReturnType } from "./hooks";

import type { PayPalCardFieldsComponent } from "@paypal/paypal-js";

export type PayPalCardFieldsContextType = {
    cardFieldsForm: PayPalCardFieldsComponent | null;
} & RegistryHookReturnType;

export const PayPalCardFieldsContext =
    createContext<PayPalCardFieldsContextType>({
        cardFieldsForm: null,
        fields: {},
        registerField: ignore, // implementation is inside hook and passed through the provider
        unregisterField: ignore, // implementation is inside hook and passed through the provider
    });
