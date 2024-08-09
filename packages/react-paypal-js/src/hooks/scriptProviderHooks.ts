import React, { useContext } from "react";

import { ScriptContext } from "../context/scriptProviderContext";
import {
    validateReducer,
    validateBraintreeAuthorizationData,
} from "./contextValidator";
import { SCRIPT_LOADING_STATE } from "../types";

import type {
    ScriptContextDerivedState,
    ScriptContextState,
    ScriptReducerAction,
} from "../types";

/**
 * Custom hook to get access to the Script context and
 * dispatch actions to modify the state on the {@link ScriptProvider} component
 *
 * @returns a tuple containing the state of the context and
 * a dispatch function to modify the state
 */
export function usePayPalScriptReducer(): [
    ScriptContextDerivedState,
    React.Dispatch<ScriptReducerAction>,
] {
    const scriptContext = validateReducer(useContext(ScriptContext));

    const derivedStatusContext = {
        ...scriptContext,
        isInitial: scriptContext.loadingStatus === SCRIPT_LOADING_STATE.INITIAL,
        isPending: scriptContext.loadingStatus === SCRIPT_LOADING_STATE.PENDING,
        isResolved:
            scriptContext.loadingStatus === SCRIPT_LOADING_STATE.RESOLVED,
        isRejected:
            scriptContext.loadingStatus === SCRIPT_LOADING_STATE.REJECTED,
    };

    return [
        derivedStatusContext,
        scriptContext.dispatch as React.Dispatch<ScriptReducerAction>,
    ];
}

/**
 * Custom hook to get access to the ScriptProvider context
 *
 * @returns the latest state of the context
 */
export function useScriptProviderContext(): [
    ScriptContextState,
    React.Dispatch<ScriptReducerAction>,
] {
    const scriptContext = validateBraintreeAuthorizationData(
        validateReducer(useContext(ScriptContext)),
    );

    return [
        scriptContext,
        scriptContext.dispatch as React.Dispatch<ScriptReducerAction>,
    ];
}
