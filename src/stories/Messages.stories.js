import React from "react";
import { PayPalScriptProvider, PayPalMessages } from "../index";

export default {
    title: "Example/PayPalMessages",
    component: PayPalMessages,
};

function Template(args) {
    return (
        <PayPalScriptProvider
            options={{ "client-id": "sb", components: "messages" }}
        >
            <PayPalMessages {...args} />
        </PayPalScriptProvider>
    );
}

export const Default = Template.bind({});
Default.args = {};

export const Flex = Template.bind({});
Flex.args = {
    style: {
        layout: "flex",
    },
};
