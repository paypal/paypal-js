import { useContext } from "react";

import { CardFieldsContext } from "../context/CardFieldsProviderContext";

import type { CardFieldsProvider } from "../components/CardFieldsProvider";
import type { CardFieldsState } from "../context/CardFieldsProviderContext";

/**
 * Returns {@link CardFieldsContext} provided by a parent {@link CardFieldsProvider}
 *
 * @returns {CardFieldsContext}
 */
export function useCardFields(): CardFieldsState {
    const context = useContext(CardFieldsContext);

    if (context === null) {
        throw new Error(
            "useCardFields must be used within a CardFieldsProvider",
        );
    }

    return context;
}
