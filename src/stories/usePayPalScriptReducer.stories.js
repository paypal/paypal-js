import React, { useState } from "react";
import {
    PayPalScriptProvider,
    usePayPalScriptReducer,
    PayPalButtons,
} from "../index";

const scriptProviderOptions = {
    "client-id": "test",
    components: "buttons",
};

export default {
    title: "Example/usePayPalScriptReducer",
    component: usePayPalScriptReducer,
    decorators: [
        (Story) => (
            <PayPalScriptProvider options={scriptProviderOptions}>
                <Story />
            </PayPalScriptProvider>
        ),
    ],
};

export const Currency = () => {
    const [{ options }, dispatch] = usePayPalScriptReducer();
    const [currency, setCurrency] = useState(options.currency);

    function onCurrencyChange({ target: { value } }) {
        setCurrency(value);
        dispatch({
            type: "resetOptions",
            value: {
                ...options,
                currency: value,
            },
        });
    }

    function createOrder(data, actions) {
        return actions.order.create({
            purchase_units: [
                {
                    amount: {
                        value: "88.44",
                        currency,
                    },
                },
            ],
        });
    }

    return (
        <>
            <select
                value={currency}
                onChange={onCurrencyChange}
                name="currency"
                id="currency"
                style={{ marginBottom: "20px" }}
            >
                <option value="USD">United States dollar</option>
                <option value="EUR">Euro</option>
                <option value="CAD">Canadian dollar</option>
            </select>
            <PayPalButtons createOrder={createOrder} />
        </>
    );
};

export const LoadingSpinner = () => {
    const [{ isPending }, dispatch] = usePayPalScriptReducer();

    function reload() {
        dispatch({
            type: "resetOptions",
            value: {
                ...scriptProviderOptions,
                "data-order-id": Date.now(),
            },
        });
    }

    return (
        <>
            <button
                type="button"
                onClick={reload}
                style={{ display: "block", marginBottom: "20px" }}
            >
                Reload
            </button>

            {isPending ? <div className="spinner" /> : null}
            <PayPalButtons />
        </>
    );
};
