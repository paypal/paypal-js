import { useContext } from "react";

import {
    CardFieldsSessionContext,
    CardFieldsStatusContext,
} from "../context/PayPalCardFieldsProviderContext";

import type { CardFieldsProvider } from "../components/PayPalCardFieldsProvider";
import type {
    CardFieldsSessionState,
    CardFieldsStatusState,
} from "../context/PayPalCardFieldsProviderContext";

/**
 * Returns {@link CardFieldsStatusState} provided by a parent {@link CardFieldsProvider}
 *
 * @returns {CardFieldsStatusState}
 */
export function useCardFields(): CardFieldsStatusState {
    const context = useContext(CardFieldsStatusContext);

    if (context === null) {
        throw new Error(
            "useCardFields must be used within a CardFieldsProvider",
        );
    }

    return context;
}

/**
 * Returns {@link CardFieldsSessionState} provided by a parent {@link CardFieldsProvider}
 *
 * @returns {CardFieldsSessionState}
 */
export function useCardFieldsSession(): CardFieldsSessionState {
    const context = useContext(CardFieldsSessionContext);

    if (context === null) {
        throw new Error(
            "useCardFieldsSession must be used within a CardFieldsProvider",
        );
    }

    return context;
}
