import React, { useEffect, useReducer } from "react";
import { loadScript } from "@paypal/paypal-js";

import {
    getScriptID,
    ScriptContext,
    scriptReducer,
} from "../context/scriptProviderContext";
import { SCRIPT_ID, SDK_SETTINGS, LOAD_SCRIPT_ERROR } from "../constants";
import { SCRIPT_LOADING_STATE, DISPATCH_ACTION } from "../types";

import type { FC } from "react";
import type { ScriptProviderProps } from "../types";

/**
This `<PayPalScriptProvider />` component takes care of loading the JS SDK `<script>`.
It manages state for script loading so children components like `<PayPalButtons />` know when it's safe to use the `window.paypal` global namespace.

Note: You always should use this component as a wrapper for  `PayPalButtons`, `PayPalMarks`, `PayPalMessages` and `BraintreePayPalButtons` components.
 */
export const PayPalScriptProvider: FC<ScriptProviderProps> = ({
    options = { clientId: "test" },
    children,
    deferLoading = false,
}: ScriptProviderProps) => {
    const [state, dispatch] = useReducer(scriptReducer, {
        options: {
            ...options,
            [SCRIPT_ID]: `${getScriptID(options)}`,
            [SDK_SETTINGS.DATA_SDK_INTEGRATION_SOURCE]:
                SDK_SETTINGS.DATA_SDK_INTEGRATION_SOURCE_VALUE,
        },
        loadingStatus: deferLoading
            ? SCRIPT_LOADING_STATE.INITIAL
            : SCRIPT_LOADING_STATE.PENDING,
    });

    useEffect(() => {
        if (
            deferLoading === false &&
            state.loadingStatus === SCRIPT_LOADING_STATE.INITIAL
        ) {
            return dispatch({
                type: DISPATCH_ACTION.LOADING_STATUS,
                value: SCRIPT_LOADING_STATE.PENDING,
            });
        }

        if (state.loadingStatus !== SCRIPT_LOADING_STATE.PENDING) {
            return;
        }

        let isSubscribed = true;

        loadScript(state.options)
            .then(() => {
                if (isSubscribed) {
                    dispatch({
                        type: DISPATCH_ACTION.LOADING_STATUS,
                        value: SCRIPT_LOADING_STATE.RESOLVED,
                    });
                }
            })
            .catch((err) => {
                console.error(`${LOAD_SCRIPT_ERROR} ${err}`);
                if (isSubscribed) {
                    dispatch({
                        type: DISPATCH_ACTION.LOADING_STATUS,
                        value: {
                            state: SCRIPT_LOADING_STATE.REJECTED,
                            message: String(err),
                        },
                    });
                }
            });
        return () => {
            isSubscribed = false;
        };
    }, [state.options, deferLoading, state.loadingStatus]);

    return (
        <ScriptContext.Provider value={{ ...state, dispatch }}>
            {children}
        </ScriptContext.Provider>
    );
};
