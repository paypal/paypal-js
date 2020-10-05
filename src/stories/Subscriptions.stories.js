import React from "react";
import { PayPalScriptProvider, PayPalButtons } from "../index";

export default {
    title: "Example/Subscriptions",
    argTypes: {
        style: { control: null },
    },
};

function Template(args) {
    return (
        <PayPalScriptProvider
            options={{
                "client-id": "sb",
                intent: "subscription",
                vault: true,
                components: "buttons",
            }}
        >
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
