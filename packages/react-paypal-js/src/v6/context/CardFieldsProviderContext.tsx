import { createContext } from "react";

import type { CardFieldsSession } from "../components/CardFieldsProvider";

export interface CardFieldsState {
    cardFieldsSession: CardFieldsSession | null;
    cardFieldsError: Error | null;
}

export const CardFieldsContext = createContext<CardFieldsState | null>(null);
