import type { PayPalScriptOptions } from "@paypal/paypal-js/types/script-options";
import type { ReactNode, Dispatch } from "react";
import { SCRIPT_ID } from "../constants";
import { BraintreePayPalCheckout } from "./braintree/paypalCheckout";
import { SCRIPT_PROVIDER_DISPATCH_ACTION, SCRIPT_LOADING_STATE } from "./enums";

export interface ReactPayPalScriptOptions extends PayPalScriptOptions {
    [SCRIPT_ID]: string;
}

export type ScriptReducerAction = {
    type: SCRIPT_PROVIDER_DISPATCH_ACTION;
    value:
        | SCRIPT_LOADING_STATE
        | ReactPayPalScriptOptions
        | PayPalScriptOptions
        | BraintreePayPalCheckout;
};

export type InitialState = {
    options: ReactPayPalScriptOptions;
    loadingStatus: SCRIPT_LOADING_STATE.INITIAL | SCRIPT_LOADING_STATE.PENDING;
};

export interface ScriptContextState {
    options: ReactPayPalScriptOptions;
    loadingStatus: SCRIPT_LOADING_STATE;
    braintreePayPalCheckoutInstance?: BraintreePayPalCheckout;
    dispatch: Dispatch<ScriptReducerAction> | null;
}

export interface StrictScriptContextState extends ScriptContextState {
    dispatch: Dispatch<ScriptReducerAction>;
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
    children?: ReactNode;
    deferLoading?: boolean;
}
