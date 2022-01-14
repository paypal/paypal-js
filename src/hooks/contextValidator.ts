import {
    SDK_SETTINGS,
    EMPTY_BRAINTREE_AUTHORIZATION_ERROR_MESSAGE,
    SCRIPT_PROVIDER_REDUCER_ERROR,
} from "../constants";
import type { ScriptContextState } from "../types";

/**
 * Check if the context is valid and ready to dispatch actions.
 *
 * @param scriptContext the result of connecting to the context provider
 * @returns strict context avoiding null values in the type
 */
export function validateReducer(
    scriptContext: ScriptContextState | null
): ScriptContextState {
    if (
        typeof scriptContext?.dispatch === "function" &&
        scriptContext.dispatch.length !== 0
    ) {
        return scriptContext;
    }

    throw new Error(SCRIPT_PROVIDER_REDUCER_ERROR);
}

/**
 * Check if the data-client-token or the data-user-id-token are
 * set in the options of the context.
 * @type data-client-token is use to pass a client token
 * @type data-user-id-token is use to pass a client tokenization key
 *
 * @param scriptContext the result of connecting to the context provider
 * @throws an {@link Error} if both data-client-token and the data-user-id-token keys are null or undefine
 * @returns strict context if one of the keys are defined
 */
export const validateBraintreeAuthorizationData = (
    scriptContext: ScriptContextState | null
): ScriptContextState => {
    if (
        !scriptContext?.options?.[SDK_SETTINGS.DATA_CLIENT_TOKEN] &&
        !scriptContext?.options?.[SDK_SETTINGS.DATA_USER_ID_TOKEN]
    ) {
        throw new Error(EMPTY_BRAINTREE_AUTHORIZATION_ERROR_MESSAGE);
    }

    return scriptContext as ScriptContextState;
};
