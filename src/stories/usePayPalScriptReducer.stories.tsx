import React, { useState, FunctionComponent, ChangeEvent } from "react";
import type { PayPalScriptOptions } from "@paypal/paypal-js/types/script-options";
import type { CreateOrderActions } from "@paypal/paypal-js/types/components/buttons";

import {
    PayPalScriptProvider,
    PayPalButtons,
    usePayPalScriptReducer,
    SCRIPT_PROVIDER_DISPATCH_ACTION,
} from "../index";
import { getOptionsFromQueryString } from "./utils";

const scriptProviderOptions: PayPalScriptOptions = {
    "client-id": "test",
    components: "buttons",
    ...getOptionsFromQueryString(),
};

export default {
    title: "Example/usePayPalScriptReducer",
    component: usePayPalScriptReducer,
};

export const Currency: FunctionComponent = () => {
    const [currency, setCurrency] = useState("USD");

    function CurrencySelect() {
        const [{ options }, dispatch] = usePayPalScriptReducer();

        function onCurrencyChange(event: ChangeEvent<HTMLSelectElement>) {
            setCurrency(event.target.value);
            dispatch({
                type: SCRIPT_PROVIDER_DISPATCH_ACTION.RESET_OPTIONS,
                value: {
                    ...options,
                    currency: event.target.value,
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

    function createOrder(
        data: Record<string, unknown>,
        actions: CreateOrderActions
    ) {
        return actions.order.create({
            purchase_units: [
                {
                    amount: {
                        value: "88.44",
                        currency_code: currency,
                    },
                },
            ],
        });
    }

    return (
        <div style={{ minHeight: "300px" }}>
            <PayPalScriptProvider
                options={{
                    ...scriptProviderOptions,
                    "data-namespace": "currency_example",
                }}
            >
                <CurrencySelect />
                <PayPalButtons createOrder={createOrder} />
            </PayPalScriptProvider>
        </div>
    );
};

export const LoadingSpinner: FunctionComponent = () => {
    function ReloadButton() {
        const [{ options }, dispatch] = usePayPalScriptReducer();

        return (
            <button
                type="button"
                style={{ display: "block", marginBottom: "20px" }}
                onClick={() => {
                    dispatch({
                        type: SCRIPT_PROVIDER_DISPATCH_ACTION.RESET_OPTIONS,
                        value: {
                            ...options,
                            "data-order-id": Date.now().toString(),
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
        <div style={{ minHeight: "300px" }}>
            <PayPalScriptProvider
                options={{
                    ...scriptProviderOptions,
                    "data-namespace": "spinner_example",
                }}
            >
                <ReloadButton />
                <LoadingSpinner />
                <PayPalButtons />
            </PayPalScriptProvider>
        </div>
    );
};
