import { createContext } from "react";

import type { HostedFieldsHandler } from "@paypal/paypal-js";

// Create the React context to use in the PayPal hosted fields provider
export const PayPalHostedFieldsContext =
    createContext<HostedFieldsHandler | null>(null);
