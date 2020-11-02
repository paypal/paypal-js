import React from "react";
import {
    PayPalScriptProvider,
    PayPalButtons,
    usePayPalScriptReducer,
} from "../index";

export default {
    title: "Example/Subscriptions",
    argTypes: {
        style: { control: null },
    },
};

const scriptOptions = {
    "client-id": "sb",
    components: "buttons",
    intent: "subscription",
    vault: true,
};

function Template(args) {
    return (
        <PayPalScriptProvider options={scriptOptions}>
            <PayPalButtons {...args} />
        </PayPalScriptProvider>
    );
}

export const Default = Template.bind({});
Default.args = {
    createSubscription: function (data, actions) {
        return actions.subscription.create({
            plan_id: "P-3RX065706M3469222L5IFM4I",
        });
    },
    style: {
        label: "subscribe",
    },
};

function OrdersAndSubscriptionsTemplate(args) {
    return (
        <PayPalScriptProvider options={scriptOptions}>
            <TransactionTypeForm />
            <br />
            <CustomPayPalButtons {...args} />
        </PayPalScriptProvider>
    );
}

function TransactionTypeForm() {
    const [, dispatch] = usePayPalScriptReducer();

    function onChange(event) {
        if (event.target.value === "subscription") {
            dispatch({
                type: "resetOptions",
                value: scriptOptions,
            });
        } else {
            const { "client-id": clientId, components } = scriptOptions;
            dispatch({
                type: "resetOptions",
                value: {
                    "client-id": clientId,
                    components,
                },
            });
        }
    }

    return (
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
    );
}

function CustomPayPalButtons(args) {
    const [{ options }] = usePayPalScriptReducer();

    const buttonOptions =
        options.intent === "subscription"
            ? {
                  createSubscription: function (data, actions) {
                      return actions.subscription.create({
                          plan_id: "P-3RX065706M3469222L5IFM4I",
                      });
                  },
                  style: {
                      label: "subscribe",
                  },
              }
            : {};

    return <PayPalButtons {...{ ...args, ...buttonOptions }} />;
}

export const OrdersAndSubscriptions = OrdersAndSubscriptionsTemplate.bind({});
OrdersAndSubscriptions.args = {};
