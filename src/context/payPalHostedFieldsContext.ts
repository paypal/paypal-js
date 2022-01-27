import { createContext } from "react";

import type { PayPalHostedFieldContext } from "../types";

// Create the React context to use in the PayPal hosted fields provider
export const PayPalHostedFieldsContext =
    createContext<PayPalHostedFieldContext>({});
