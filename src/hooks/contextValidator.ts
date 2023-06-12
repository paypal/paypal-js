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
 * Check if the dataClientToken or the dataUserIdToken are
 * set in the options of the context.
 * @type dataClientToken is use to pass a client token
 * @type dataUserIdToken is use to pass a client tokenization key
 *
 * @param scriptContext the result of connecting to the context provider
 * @throws an {@link Error} if both dataClientToken and the dataUserIdToken keys are null or undefined
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
