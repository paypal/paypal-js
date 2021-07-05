import React, {
    createContext,
    useContext,
    useEffect,
    useReducer,
    FunctionComponent,
} from "react";
import { loadScript } from "@paypal/paypal-js";
import type { PayPalScriptOptions } from "@paypal/paypal-js/types/script-options";

export interface ReactPayPalScriptOptions extends PayPalScriptOptions {
    "data-react-paypal-script-id": string;
}

const SCRIPT_LOADING_STATE = {
    INITIAL: "initial",
    PENDING: "pending",
    REJECTED: "rejected",
    RESOLVED: "resolved",
} as const;

type ScriptLoadingState =
    typeof SCRIPT_LOADING_STATE[keyof typeof SCRIPT_LOADING_STATE];

interface ScriptContextState {
    options: ReactPayPalScriptOptions;
    loadingStatus: ScriptLoadingState;
}

interface ScriptContextDerivedState {
    options: ReactPayPalScriptOptions;
    isInitial: boolean;
    isPending: boolean;
    isRejected: boolean;
    isResolved: boolean;
}

type ScriptReducerAction =
    | {
          type: "setLoadingStatus";
          value: ScriptLoadingState;
      }
    | {
          type: "resetOptions";
          value: PayPalScriptOptions | ReactPayPalScriptOptions;
      };

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
            // destroy existing script to make sure only one script loads at a time
            destroySDKScript(state.options["data-react-paypal-script-id"]);
            return {
                loadingStatus: SCRIPT_LOADING_STATE.PENDING,
                options: {
                    ...action.value,
                    "data-react-paypal-script-id": `${getNewScriptID()}`,
                },
            };

        default: {
            return state;
        }
    }
}

function getNewScriptID() {
    return `react-paypal-js-${Math.random().toString(36).substring(7)}`;
}

function destroySDKScript(reactPayPalScriptID: string) {
    const scriptNode = document.querySelector(
        `script[data-react-paypal-script-id="${reactPayPalScriptID}"]`
    );
    if (scriptNode === null) return;

    if (scriptNode.parentNode) {
        scriptNode.parentNode.removeChild(scriptNode);
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
        isInitial: loadingStatus === SCRIPT_LOADING_STATE.INITIAL,
        isPending: loadingStatus === SCRIPT_LOADING_STATE.PENDING,
        isResolved: loadingStatus === SCRIPT_LOADING_STATE.RESOLVED,
        isRejected: loadingStatus === SCRIPT_LOADING_STATE.REJECTED,
    };

    return [derivedStatusContext, dispatchContext];
}

interface ScriptProviderProps {
    options: PayPalScriptOptions;
    children?: React.ReactNode;
    deferLoading?: boolean;
}

const PayPalScriptProvider: FunctionComponent<ScriptProviderProps> = ({
    options,
    children,
    deferLoading = false,
}: ScriptProviderProps) => {
    const initialState = {
        options: {
            ...options,
            "data-react-paypal-script-id": `${getNewScriptID()}`,
        },
        loadingStatus: deferLoading
            ? SCRIPT_LOADING_STATE.INITIAL
            : SCRIPT_LOADING_STATE.PENDING,
    };

    const [state, dispatch] = useReducer(scriptReducer, initialState);

    useEffect(() => {
        if (
            deferLoading === false &&
            state.loadingStatus === SCRIPT_LOADING_STATE.INITIAL
        ) {
            return dispatch({
                type: "setLoadingStatus",
                value: SCRIPT_LOADING_STATE.PENDING,
            });
        }

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
    }, [options, deferLoading, state.loadingStatus]);

    return (
        <ScriptContext.Provider value={state}>
            <ScriptDispatchContext.Provider value={dispatch}>
                {children}
            </ScriptDispatchContext.Provider>
        </ScriptContext.Provider>
    );
};

export { PayPalScriptProvider, usePayPalScriptReducer };
