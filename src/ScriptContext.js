import React, { createContext, useContext, useEffect, useReducer } from "react";
import PropTypes from "prop-types";
import { loadScript } from "@paypal/paypal-js";

const ScriptContext = createContext();
const ScriptDispatchContext = createContext();

function scriptReducer(state, action) {
    switch (action.type) {
        case "setIsLoaded":
            return {
                options: {
                    ...state.options,
                },
                isLoaded: action.value,
            };
        case "changeCurrency":
            return {
                options: {
                    ...state.options,
                    currency: action.value,
                },
                isLoaded: false,
            };

        default: {
            throw new Error(`Unhandled action type: ${action.type}`);
        }
    }
}

function useScriptReducer() {
    const scriptContext = useContext(ScriptContext);
    const dispatchContext = React.useContext(ScriptDispatchContext);
    if (scriptContext === undefined || dispatchContext === undefined) {
        throw new Error(
            "useScriptReducer must be used within a ScriptProvider"
        );
    }
    return [scriptContext, dispatchContext];
}

function ScriptProvider({ options, children }) {
    const initialState = {
        options,
        isLoaded: false,
    };

    const [state, dispatch] = useReducer(scriptReducer, initialState);

    useEffect(() => {
        if (state.isLoaded) return;

        let isSubscribed = true;
        loadScript(state.options).then(() => {
            if (isSubscribed) {
                dispatch({ type: "setIsLoaded", value: true });
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

ScriptProvider.propTypes = {
    children: PropTypes.element.isRequired,
    options: PropTypes.exact({
        "buyer-country": PropTypes.string,
        "client-id": PropTypes.string.isRequired,
        commit: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
        components: PropTypes.string,
        currency: PropTypes.string,
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

export { ScriptProvider, useScriptReducer };
