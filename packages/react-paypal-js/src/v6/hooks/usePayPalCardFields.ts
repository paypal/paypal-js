import { useContext } from "react";

import {
    CardFieldsSessionContext,
    CardFieldsStatusContext,
} from "../context/PayPalCardFieldsProviderContext";

import type { PayPalCardFieldsProvider } from "../components/PayPalCardFieldsProvider";
import type {
    CardFieldsSessionState,
    CardFieldsStatusState,
} from "../context/PayPalCardFieldsProviderContext";

/**
 * Returns {@link CardFieldsStatusState} provided by a parent {@link PayPalCardFieldsProvider}
 *
 * @returns {CardFieldsStatusState}
 */
export function usePayPalCardFields(): CardFieldsStatusState {
    const context = useContext(CardFieldsStatusContext);

    if (context === null) {
        throw new Error(
            "usePayPalCardFields must be used within a PayPalCardFieldsProvider",
        );
    }

    return context;
}

/**
 * Returns {@link CardFieldsSessionState} provided by a parent {@link PayPalCardFieldsProvider}
 *
 * @returns {CardFieldsSessionState}
 */
export function usePayPalCardFieldsSession(): CardFieldsSessionState {
    const context = useContext(CardFieldsSessionContext);

    if (context === null) {
        throw new Error(
            "usePayPalCardFieldsSession must be used within a PayPalCardFieldsProvider",
        );
    }

    return context;
}
