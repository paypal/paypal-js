import React, { FC, useEffect, useReducer } from "react";
import { loadScript } from "@paypal/paypal-js";

import {
    getScriptID,
    ScriptContext,
    scriptReducer,
} from "../context/scriptProviderContext";
import {
    SCRIPT_ID,
    DATA_SDK_INTEGRATION_SOURCE,
    DATA_SDK_INTEGRATION_SOURCE_VALUE,
} from "../constants";
import type { ScriptProviderProps } from "../types";
import { SCRIPT_LOADING_STATE, DISPATCH_ACTION } from "../types";

export const PayPalScriptProvider: FC<ScriptProviderProps> = ({
    options = { "client-id": "test" },
    children,
    deferLoading = false,
}: ScriptProviderProps) => {
    const [state, dispatch] = useReducer(scriptReducer, {
        options: {
            ...options,
            [SCRIPT_ID]: `${getScriptID(options)}`,
            [DATA_SDK_INTEGRATION_SOURCE]: DATA_SDK_INTEGRATION_SOURCE_VALUE,
        },
        loadingStatus: deferLoading
            ? SCRIPT_LOADING_STATE.INITIAL
            : SCRIPT_LOADING_STATE.PENDING,
        dispatch: null,
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

        if (state.loadingStatus !== SCRIPT_LOADING_STATE.PENDING) return;

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
            .catch(() => {
                if (isSubscribed) {
                    dispatch({
                        type: DISPATCH_ACTION.LOADING_STATUS,
                        value: SCRIPT_LOADING_STATE.REJECTED,
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
