import React, { createContext, useContext, useEffect, useReducer } from "react";
import PropTypes from "prop-types";
import { loadScript } from "@paypal/paypal-js";

const SCRIPT_LOADING_STATE = {
    PENDING: "pending",
    REJECTED: "rejected",
    RESOLVED: "resolved",
};

const ScriptContext = createContext();
const ScriptDispatchContext = createContext();

function scriptReducer(state, action) {
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
            throw new Error(`Unhandled action type: ${action.type}`);
        }
    }
}

function usePayPalScriptReducer() {
    const scriptContext = useContext(ScriptContext);
    const dispatchContext = useContext(ScriptDispatchContext);
    if (scriptContext === undefined || dispatchContext === undefined) {
        throw new Error(
            "useScriptReducer must be used within a ScriptProvider"
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

function PayPalScriptProvider({ options, children }) {
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

PayPalScriptProvider.propTypes = {
    children: PropTypes.node.isRequired,
    options: PropTypes.exact({
        "buyer-country": PropTypes.string,
        "client-id": PropTypes.string.isRequired,
        commit: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
        components: PropTypes.string,
        currency: PropTypes.string,
        "data-client-token": PropTypes.string,
        "data-csp-nonce": PropTypes.string,
        "data-order-id": PropTypes.string,
        "data-page-type": PropTypes.string,
        "data-partner-attribution-id": PropTypes.string,
        debug: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
        "disable-funding": PropTypes.string,
        "integration-date": PropTypes.string,
        intent: PropTypes.string,
        locale: PropTypes.string,
        "merchant-id": PropTypes.string,
        vault: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
    }),
};

export { PayPalScriptProvider, usePayPalScriptReducer };
