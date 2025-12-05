import { createContext } from "react";
import { CardFieldsSession } from "../components/CardFieldsProvider";

export interface CardFieldsState {
    cardFieldsSession: CardFieldsSession | null;
    cardFieldsError: Error | null;
}

export const CardFieldsContext = createContext<CardFieldsState | null>(null);
