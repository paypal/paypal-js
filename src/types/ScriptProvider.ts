import type { PayPalScriptOptions } from "@paypal/paypal-js/types/script-options";
import { SCRIPT_ID } from "../constants";

export enum SCRIPT_LOADING_STATE {
    INITIAL = "initial",
    PENDING = "pending",
    REJECTED = "rejected",
    RESOLVED = "resolved",
}

export enum DISPATCH_ACTION {
    LOADING_STATUS = "setLoadingStatus",
    RESET_OPTIONS = "resetOptions",
}

export interface ReactPayPalScriptOptions extends PayPalScriptOptions {
    [SCRIPT_ID]: string;
}

export type ScriptReducerAction = {
    type: DISPATCH_ACTION;
    value:
        | SCRIPT_LOADING_STATE
        | ReactPayPalScriptOptions
        | PayPalScriptOptions;
};

export type InitialState = {
    options: ReactPayPalScriptOptions;
    loadingStatus: SCRIPT_LOADING_STATE.INITIAL | SCRIPT_LOADING_STATE.PENDING;
};

export interface ScriptContextState {
    options: ReactPayPalScriptOptions;
    loadingStatus: SCRIPT_LOADING_STATE;
    dispatch: React.Dispatch<ScriptReducerAction> | null;
}

export interface ScriptContextDerivedState {
    options: ReactPayPalScriptOptions;
    isInitial: boolean;
    isPending: boolean;
    isRejected: boolean;
    isResolved: boolean;
}

export interface ScriptProviderProps {
    options: PayPalScriptOptions;
    children?: React.ReactNode;
    deferLoading?: boolean;
}
