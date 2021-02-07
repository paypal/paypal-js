import React, { createContext, useContext, useEffect, useReducer } from "react";
import { loadScript } from "@paypal/paypal-js";
import type { PayPalScriptOptions } from "@paypal/paypal-js/types/script-options";

enum SCRIPT_LOADING_STATE {
    PENDING = "pending",
    REJECTED = "rejected",
    RESOLVED = "resolved",
}

interface ScriptContextState {
    options: PayPalScriptOptions;
    loadingStatus: SCRIPT_LOADING_STATE;
}

interface ScriptContextDerivedState {
    options: PayPalScriptOptions;
    isPending: boolean;
    isRejected: boolean;
    isResolved: boolean;
}

type ScriptReducerAction =
    | { type: "setLoadingStatus"; value: SCRIPT_LOADING_STATE }
    | { type: "resetOptions"; value: PayPalScriptOptions };

type ScriptReducerDispatch = (action: ScriptReducerAction) => void;

const ScriptContext = createContext<ScriptContextState | null>(null);
const ScriptDispatchContext = createContext<ScriptReducerDispatch | null>(null);

function scriptReducer(state: ScriptContextState, action: ScriptReducerAction) {
    switch (action.type) {
        case "setLoadingStatus":
            return {
                options: {
                    ...state.options,
                },
                loadingStatus: action.value,
            };
        case "resetOptions":
            return {
                loadingStatus: SCRIPT_LOADING_STATE.PENDING,
                options: action.value,
            };

        default: {
            return state;
        }
    }
}

function usePayPalScriptReducer(): [
    ScriptContextDerivedState,
    ScriptReducerDispatch
] {
    const scriptContext = useContext(ScriptContext);
    const dispatchContext = useContext(ScriptDispatchContext);

    if (scriptContext === null || dispatchContext === null) {
        throw new Error(
            "usePayPalScriptReducer must be used within a PayPalScriptProvider"
        );
    }

    const { loadingStatus, ...restScriptContext } = scriptContext;

    const derivedStatusContext = {
        ...restScriptContext,
        isPending: loadingStatus === SCRIPT_LOADING_STATE.PENDING,
        isResolved: loadingStatus === SCRIPT_LOADING_STATE.RESOLVED,
        isRejected: loadingStatus === SCRIPT_LOADING_STATE.REJECTED,
    };

    return [derivedStatusContext, dispatchContext];
}

interface ScriptProviderProps {
    options: PayPalScriptOptions;
    children?: React.ReactNode;
}

function PayPalScriptProvider({ options, children }: ScriptProviderProps) {
    const initialState = {
        options,
        loadingStatus: SCRIPT_LOADING_STATE.PENDING,
    };

    const [state, dispatch] = useReducer(scriptReducer, initialState);

    useEffect(() => {
        if (state.loadingStatus !== SCRIPT_LOADING_STATE.PENDING) return;

        let isSubscribed = true;
        loadScript(state.options)
            .then(() => {
                if (isSubscribed) {
                    dispatch({
                        type: "setLoadingStatus",
                        value: SCRIPT_LOADING_STATE.RESOLVED,
                    });
                }
            })
            .catch(() => {
                if (isSubscribed) {
                    dispatch({
                        type: "setLoadingStatus",
                        value: SCRIPT_LOADING_STATE.REJECTED,
                    });
                }
            });
        return () => {
            isSubscribed = false;
        };
    });

    return (
        <ScriptContext.Provider value={state}>
            <ScriptDispatchContext.Provider value={dispatch}>
                {children}
            </ScriptDispatchContext.Provider>
        </ScriptContext.Provider>
    );
}

export { PayPalScriptProvider, usePayPalScriptReducer };
