import React from "react";
import {
    PayPalScriptProvider,
    PayPalButtons,
    usePayPalScriptReducer,
} from "../index";

const scriptProviderOptions = {
    "client-id": "sb",
    components: "buttons",
    intent: "subscription",
    vault: true,
};

export default {
    title: "Example/Subscriptions",
    decorators: [
        (Story) => (
            <PayPalScriptProvider options={scriptProviderOptions}>
                <Story />
            </PayPalScriptProvider>
        ),
    ],
};

export const Default = () => (
    <PayPalButtons
        createSubscription={(data, actions) =>
            actions.subscription.create({
                plan_id: "P-3RX065706M3469222L5IFM4I",
            })
        }
        style={{
            label: "subscribe",
        }}
    />
);

export const OrdersAndSubscriptions = () => {
    const [{ options }, dispatch] = usePayPalScriptReducer();

    const buttonSubscriptionOptions = {
        createSubscription: function (data, actions) {
            return actions.subscription.create({
                plan_id: "P-3RX065706M3469222L5IFM4I",
            });
        },
        style: {
            label: "subscribe",
        },
    };

    const buttonOptions =
        options.intent === "subscription" ? buttonSubscriptionOptions : {};

    function onChange({ target: { value } }) {
        dispatch({
            type: "resetOptions",
            value:
                value === "subscription"
                    ? scriptProviderOptions
                    : {
                          "client-id": scriptProviderOptions["client-id"],
                          components: scriptProviderOptions.components,
                      },
        });
    }

    return (
        <>
            <form>
                <label>
                    <input
                        defaultChecked
                        onChange={onChange}
                        type="radio"
                        name="type"
                        value="subscription"
                    />
                    Subscription
                </label>
                <label>
                    <input
                        onChange={onChange}
                        type="radio"
                        name="type"
                        value="order"
                    />
                    Order
                </label>
            </form>
            <br />
            <PayPalButtons {...buttonOptions} />
        </>
    );
};
