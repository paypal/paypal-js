import { useContext } from "react";

import { PayPalContext } from "../context/PayPalProviderContext";

import type { PayPalProvider } from "../components/PayPalProvider";
import type { PayPalState } from "../context/PayPalProviderContext";

/**
 * Returns {@link PayPalState} provided by a parent {@link PayPalProvider}.
 *
 * @returns {PayPalState}
 */
export function usePayPal(): PayPalState {
    const context = useContext(PayPalContext);

    if (context === null) {
        throw new Error("usePayPal must be used within a PayPalProvider");
    }

    return context;
}
