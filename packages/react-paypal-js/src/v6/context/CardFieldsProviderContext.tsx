import { createContext } from "react";

import type {
    CardFieldsSession,
    CardFieldsSessionType,
} from "../components/CardFieldsProvider";

export interface CardFieldsSessionState {
    cardFieldsSession: CardFieldsSession | null;
    cardFieldsSessionType: CardFieldsSessionType;
}

export const CardFieldsSessionContext =
    createContext<CardFieldsSessionState | null>(null);

export interface CardFieldsStatusState {
    cardFieldsError: Error | null;
}

export const CardFieldsStatusContext =
    createContext<CardFieldsStatusState | null>(null);
