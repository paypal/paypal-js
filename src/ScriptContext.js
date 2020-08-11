import React, { createContext, useContext, useEffect, useReducer } from 'react';
import PropTypes from 'prop-types';
import { loadScript } from '@paypal/paypal-js';

const ScriptContext = createContext();
const ScriptDispatchContext = createContext();

function scriptReducer(state, action) {
    switch (action.type) {
    case 'setLoadingState':
        return {
            options: {
                ...state.options
            },
            isLoaded: action.value
        };
    case 'changeCurrency':
        return {
            options: {
                ...state.options,
                currency: action.value
            },
            isLoaded: false
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
        throw new Error('useScriptReducer must be used within a ScriptProvider');
    }
    return [scriptContext, dispatchContext];
}

function ScriptProvider({options, children}) {
    const initialState = {
        options,
        isLoaded: false
    };

    const [state, dispatch] = useReducer(scriptReducer, initialState);

    useEffect(() => {
        if (state.isLoaded) return;

        let isSubscribed = true;
        loadScript(state.options).then(() => {
            if (isSubscribed) {
                dispatch({ type: 'setLoadingState', value: true });
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
    children: PropTypes.any,
    options: PropTypes.shape({
        'client-id': PropTypes.string.isRequired
    })
};

export {ScriptProvider, useScriptReducer};
