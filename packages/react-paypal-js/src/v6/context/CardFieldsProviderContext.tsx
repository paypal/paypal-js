import { createContext } from "react";

import type { CardFieldsSession } from "../components/CardFieldsProvider";

export interface CardFieldsSessionState {
    cardFieldsSession: CardFieldsSession | null;
}

export const CardFieldsSessionContext =
    createContext<CardFieldsSessionState | null>(null);

export interface CardFieldsStatusState {
    cardFieldsError: Error | null;
}

export const CardFieldsStatusContext =
    createContext<CardFieldsStatusState | null>(null);
