import { useContext } from "react";

import { ScriptContext } from "../context/scriptProviderContext";
import { contextNotEmptyValidator } from "./contextValidator";
import type { ScriptContextDerivedState, ScriptReducerAction } from "../types";
import { SCRIPT_LOADING_STATE } from "../types";

/**
 * Custom hook to get access to the Script context and
 * dispatch actions to modify the state on the {@link ScriptProvider} component
 *
 * @returns a tuple containing the state of the context and
 * a dispatch function to modify the state
 */
export function usePayPalScriptReducer(): [
    ScriptContextDerivedState,
    React.Dispatch<ScriptReducerAction>
] {
    const scriptContext = contextNotEmptyValidator(useContext(ScriptContext));

    const derivedStatusContext = {
        ...scriptContext,
        isInitial: scriptContext.loadingStatus === SCRIPT_LOADING_STATE.INITIAL,
        isPending: scriptContext.loadingStatus === SCRIPT_LOADING_STATE.PENDING,
        isResolved:
            scriptContext.loadingStatus === SCRIPT_LOADING_STATE.RESOLVED,
        isRejected:
            scriptContext.loadingStatus === SCRIPT_LOADING_STATE.REJECTED,
    };

    return [derivedStatusContext, scriptContext.dispatch];
}
