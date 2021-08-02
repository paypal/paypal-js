import { useContext } from "react";

import {
    SCRIPT_LOADING_STATE,
    ScriptContextDerivedState,
    ScriptReducerAction,
} from "../types/ScriptProvider";
import { ScriptContext } from "../context/ScriptProvider";

/**
 * Custom hook to get access to the Script context and
 * dispatch actions to modify the state on the {@link ScriptProvider} component
 *
 * @returns
 */
export function usePayPalScriptReducer(): [
    ScriptContextDerivedState,
    React.Dispatch<ScriptReducerAction>
] {
    const scriptContext = useContext(ScriptContext);
    if (scriptContext == null || scriptContext?.dispatch == null) {
        throw new Error(
            "usePayPalScriptReducer must be used within a PayPalScriptProvider"
        );
    }

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
