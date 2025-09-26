import { useContext } from "react";

import { InstanceContext } from "../context/InstanceProviderContext";

import type { InstanceContextState } from "../types/InstanceProviderTypes";

export function usePayPalInstance(): InstanceContextState {
    const context = useContext(InstanceContext);

    if (context === null) {
        throw new Error(
            "usePayPalInstance must be used within a PayPalInstanceProvider",
        );
    }

    return context;
}
