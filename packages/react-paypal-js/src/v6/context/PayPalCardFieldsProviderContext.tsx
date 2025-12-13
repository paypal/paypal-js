import { createContext } from "react";

import type {
    CardFieldsSession,
    CardFieldsSessionType,
} from "../components/PayPalCardFieldsProvider";

export interface CardFieldsSessionState {
    cardFieldsSession: CardFieldsSession | null;
    setCardFieldsSessionType: (
        cardFieldsSessionType: CardFieldsSessionType,
    ) => void;
}

export const CardFieldsSessionContext =
    createContext<CardFieldsSessionState | null>(null);

export interface CardFieldsStatusState {
    cardFieldsError: Error | null;
}

export const CardFieldsStatusContext =
    createContext<CardFieldsStatusState | null>(null);
