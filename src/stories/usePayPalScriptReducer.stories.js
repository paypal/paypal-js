import React, { useState } from "react";
import {
    PayPalScriptProvider,
    usePayPalScriptReducer,
    PayPalButtons,
} from "../index";

export default {
    title: "Example/usePayPalScriptReducer",
    component: usePayPalScriptReducer,
};

const defaultOptions = {
    "client-id": "sb",
    components: "buttons",
};

function Currency() {
    const [state, dispatch] = usePayPalScriptReducer();
    const {
        options: { currency },
    } = state;
    const [value, setValue] = useState(currency);

    function onChange(event) {
        const value = event.target.value;
        setValue(value);
        dispatch({ type: "changeCurrency", value });
    }

    return (
        <select value={value} onChange={onChange} name="currency" id="currency">
            <option value="USD">United States dollar</option>
            <option value="EUR">Euro</option>
            <option value="CAD">Canadian dollar</option>
        </select>
    );
}

function Template(args) {
    return (
        <PayPalScriptProvider {...args}>
            <Currency />
            <PayPalButtons />
        </PayPalScriptProvider>
    );
}

export const currencyUSD = Template.bind({});
currencyUSD.args = {
    options: {
        ...defaultOptions,
        currency: "USD",
    },
};

export const currencyEUR = Template.bind({});
currencyEUR.args = {
    options: {
        ...defaultOptions,
        currency: "EUR",
    },
};

function LoadingSpinnerTemplate(args) {
    return (
        <PayPalScriptProvider
            options={{ "client-id": "sb", components: "buttons" }}
        >
            <LoadingIndicator />
            <PayPalButtons {...args} />
        </PayPalScriptProvider>
    );
}

export const LoadingSpinner = LoadingSpinnerTemplate.bind({});
LoadingSpinner.args = {};

function LoadingIndicator() {
    const [{ isLoaded }] = usePayPalScriptReducer();

    if (isLoaded) return null;
    if (!isLoaded) return <div className="spinner" />;
}
