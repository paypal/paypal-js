import { createContext } from "react";

import { hashStr } from "../utils";
import { SCRIPT_ID, SDK_SETTINGS } from "../constants";
import { DISPATCH_ACTION, SCRIPT_LOADING_STATE } from "../types";

import type { BraintreePayPalCheckout } from "../types/braintree/paypalCheckout";
import type {
    ScriptContextState,
    ReactPayPalScriptOptions,
    ScriptReducerAction,
} from "../types";

/**
 * Generate a new random identifier for react-paypal-js
 *
 * @returns the {@code string} containing the random library name
 */
export function getScriptID(options: ReactPayPalScriptOptions): string {
    // exclude the data-react-paypal-script-id value from the options hash
    const { [SCRIPT_ID]: _scriptId, ...paypalScriptOptions } = options;

    return `react-paypal-js-${hashStr(JSON.stringify(paypalScriptOptions))}`;
}

/**
 * Destroy the PayPal SDK from the document page
 *
 * @param reactPayPalScriptID the script identifier
 */
export function destroySDKScript(reactPayPalScriptID?: string): void {
    const scriptNode = self.document.querySelector<HTMLScriptElement>(
        `script[${SCRIPT_ID}="${reactPayPalScriptID}"]`,
    );

    if (scriptNode?.parentNode) {
        scriptNode.parentNode.removeChild(scriptNode);
    }
}

/**
 * Reducer function to handle complex state changes on the context
 *
 * @param state  the current state on the context object
 * @param action the action to be executed on the previous state
 * @returns a the same state if the action wasn't found, or a new state otherwise
 */
export function scriptReducer(
    state: ScriptContextState,
    action: ScriptReducerAction,
): ScriptContextState {
    switch (action.type) {
        case DISPATCH_ACTION.LOADING_STATUS:
            if (typeof action.value === "object") {
                return {
                    ...state,
                    loadingStatus: action.value.state as SCRIPT_LOADING_STATE,
                    loadingStatusErrorMessage: action.value.message,
                };
            }

            return {
                ...state,
                loadingStatus: action.value as SCRIPT_LOADING_STATE,
            };
        case DISPATCH_ACTION.RESET_OPTIONS:
            // destroy existing script to make sure only one script loads at a time
            destroySDKScript(state.options[SCRIPT_ID]);

            return {
                ...state,
                loadingStatus: SCRIPT_LOADING_STATE.PENDING,
                options: {
                    [SDK_SETTINGS.DATA_SDK_INTEGRATION_SOURCE]:
                        SDK_SETTINGS.DATA_LIBRARY_VALUE,
                    ...action.value,
                    [SCRIPT_ID]: `${getScriptID(action.value)}`,
                },
            };
        case DISPATCH_ACTION.SET_BRAINTREE_INSTANCE:
            return {
                ...state,
                braintreePayPalCheckoutInstance:
                    action.value as BraintreePayPalCheckout,
            };
        default: {
            return state;
        }
    }
}

// Create the React context to use in the script provider component
export const ScriptContext = createContext<ScriptContextState | null>(null);
