import { useContext } from "react";

import { PayPalContext } from "../context/PayPalProviderContext";

import type { PayPalProvider } from "../components/PayPalProvider";
import type { PayPalContextValue } from "../types/PayPalProviderTypes.d.ts";

/**
 * Returns {@link PayPalContext} provided by a parent {@link PayPalProvider}.
 *
 * @returns {PayPalContext}
 */
export function usePayPal(): PayPalContextValue {
    const context = useContext(PayPalContext);

    if (context === null) {
        throw new Error("usePayPal must be used within a PayPalProvider");
    }

    return context;
}
