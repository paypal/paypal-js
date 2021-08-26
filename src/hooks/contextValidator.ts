import {
    DATA_CLIENT_TOKEN,
    EMPTY_PROVIDER_CONTEXT_ERROR_MESSAGE,
    EMPTY_PROVIDER_CONTEXT_CLIENT_TOKEN_ERROR_MESSAGE,
} from "../constants";
import type { ScriptContextState, StrictScriptContextState } from "../types";

/**
 * Check if the context is available checking the state and dispatch function
 *
 * @param scriptContext the result of connecting to the context provider
 * @returns strict context avoiding null values in the type
 */
export function contextNotEmptyValidator(
    scriptContext: ScriptContextState | null
): StrictScriptContextState {
    if (scriptContext == null || scriptContext?.dispatch == null) {
        throw new Error(EMPTY_PROVIDER_CONTEXT_ERROR_MESSAGE);
    }

    return scriptContext as StrictScriptContextState;
}

/**
 * Check if the data-client-token is set in the options of the context
 * This is required to create a Braintree client
 *
 * @param scriptContext the result of connecting to the context provider
 * @returns strict context avoiding null values in the type and client token
 */
export const contextOptionClientTokenNotEmptyValidator = (
    scriptContext: ScriptContextState | null
): StrictScriptContextState => {
    if (scriptContext?.options[DATA_CLIENT_TOKEN] == null) {
        throw new Error(EMPTY_PROVIDER_CONTEXT_CLIENT_TOKEN_ERROR_MESSAGE);
    }

    return scriptContext as StrictScriptContextState;
};
