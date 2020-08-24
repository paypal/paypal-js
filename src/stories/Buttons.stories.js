import React from "react";
import { PayPalScriptProvider, PayPalButtons } from "../index";

export default {
    title: "Example/PayPalButtons",
    component: PayPalButtons,
};

function Template(args) {
    return (
        <PayPalScriptProvider
            options={{ "client-id": "sb", components: "buttons" }}
        >
            <PayPalButtons {...args} />
        </PayPalScriptProvider>
    );
}

export const Default = Template.bind({});
Default.args = {};

export const Horizontal = Template.bind({});
Horizontal.args = {
    style: {
        layout: "horizontal",
    },
};

export const CustomStyle = Template.bind({});
CustomStyle.args = {
    style: {
        color: "blue",
        shape: "pill",
        label: "pay",
        height: 40,
    },
};
