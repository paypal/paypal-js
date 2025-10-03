import { useContext } from "react";

import { PayPalContext } from "../context/PayPalProviderContext";

import type { PayPalContextState } from "../types/PayPalProviderTypes";

export function usePayPal(): PayPalContextState {
    const context = useContext(PayPalContext);

    if (context === null) {
        throw new Error("usePayPal must be used within a PayPalProvider");
    }

    return context;
}
