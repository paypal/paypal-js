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
};

export const Currency = () => {
    const [currency, setCurrency] = useState("USD");

    function CurrencySelect() {
        const [{ options }, dispatch] = usePayPalScriptReducer();

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

        return (
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
        );
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
        <PayPalScriptProvider options={scriptProviderOptions}>
            <CurrencySelect />
            <PayPalButtons createOrder={createOrder} />
        </PayPalScriptProvider>
    );
};

export const LoadingSpinner = () => {
    function ReloadButton() {
        const [{ options }, dispatch] = usePayPalScriptReducer();

        return (
            <button
                type="button"
                style={{ display: "block", marginBottom: "20px" }}
                onClick={() => {
                    dispatch({
                        type: "resetOptions",
                        value: {
                            ...options,
                            "data-order-id": Date.now(),
                        },
                    });
                }}
            >
                Reload
            </button>
        );
    }

    function LoadingSpinner() {
        const [{ isPending }] = usePayPalScriptReducer();
        return isPending ? <div className="spinner" /> : null;
    }

    return (
        <PayPalScriptProvider options={scriptProviderOptions}>
            <ReloadButton />
            <LoadingSpinner />
            <PayPalButtons />
        </PayPalScriptProvider>
    );
};
