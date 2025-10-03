import { useContext } from "react";

import { PayPalContext } from "../context/PayPalProviderContext";

import type { InstanceContextState } from "../types/PayPalProviderTypes";

export function usePayPal(): InstanceContextState {
    const context = useContext(PayPalContext);

    if (context === null) {
        throw new Error("usePayPal must be used within a PayPalProvider");
    }

    return context;
}
