import { useContext } from "react";

import { ScriptContext } from "../context/scriptProviderContext";
import {
    contextNotEmptyValidator,
    contextOptionClientTokenNotEmptyValidator,
} from "./contextValidator";
import type { ScriptContextState, ScriptReducerAction } from "../types";

/**
 * Custom hook to get access to the ScriptProvider context
 *
 * @returns the state of the context
 */
export function useBraintreeProviderContext(): [
    ScriptContextState,
    React.Dispatch<ScriptReducerAction>
] {
    const scriptContext = contextOptionClientTokenNotEmptyValidator(
        contextNotEmptyValidator(useContext(ScriptContext))
    );

    return [scriptContext, scriptContext.dispatch];
}
