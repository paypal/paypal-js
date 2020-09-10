import React from "react";
import { PayPalScriptProvider, PayPalButtons } from "../index";

export default {
    title: "Example/PayPalButtons",
    component: PayPalButtons,
    argTypes: {
        shippingPreference: { control: null },
        style: { control: null },
    },
};

const defaultOptions = {
    "client-id": "sb",
    components: "buttons",
};

function Template(args) {
    return (
        <PayPalScriptProvider options={defaultOptions}>
            <PayPalButtons {...args} />
        </PayPalScriptProvider>
    );
}

function prettyPrint(obj) {
    return JSON.stringify(obj, null, 4);
}

export const Default = Template.bind({});
Default.args = {};
Default.parameters = {
    docs: {
        source: {
            code: "<PayPalButtons />",
        },
    },
};

export const Horizontal = Template.bind({});
Horizontal.args = {
    style: {
        layout: "horizontal",
    },
};

Horizontal.parameters = {
    docs: {
        source: {
            code: `<PayPalButtons style={${prettyPrint(
                Horizontal.args.style
            )}} />`,
        },
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

CustomStyle.parameters = {
    docs: {
        source: {
            code: `<PayPalButtons style={${prettyPrint(
                CustomStyle.args.style
            )}} />`,
        },
    },
};
