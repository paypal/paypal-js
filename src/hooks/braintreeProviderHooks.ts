import { useContext } from "react";

import type { ScriptContextState } from "../types/scriptProviderTypes";
import type { ScriptReducerAction } from "../types/scriptProviderTypes";
import { ScriptContext } from "../context/scriptProviderContext";
import {
    contextNotEmptyValidator,
    contextOptionClientTokenNotEmptyValidator,
} from "./contextValidator";

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
