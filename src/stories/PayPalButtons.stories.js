import React, { useState } from "react";
import { FUNDING, PayPalScriptProvider, PayPalButtons } from "../index";

export default {
    title: "Example/PayPalButtons",
    component: PayPalButtons,
    argTypes: {
        style: { control: null },
    },
    args: {
        // Storybook passes empty functions by default for props like `onShippingChange`.
        // This turns on the `onShippingChange()` feature which uses the popup experience with the Standard Card button.
        // We pass null to opt-out so the inline guest feature works as expected with the Standard Card button.
        onShippingChange: null,
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

export const StandAlone = Template.bind({});
StandAlone.args = { fundingSource: FUNDING.PAYLATER };

StandAlone.parameters = {
    docs: {
        source: {
            code: "<PayPalButtons fundingSource={FUNDING.PAYLATER} />",
        },
    },
};

function DynamicAmountTemplate(args) {
    const [amount, setAmount] = useState(2);
    const [orderID, setOrderID] = useState(false);

    function createOrder(data, actions) {
        return actions.order
            .create({
                purchase_units: [
                    {
                        amount: {
                            value: amount,
                        },
                    },
                ],
            })
            .then((orderID) => {
                setOrderID(orderID);
                return orderID;
            });
    }

    function onChange(event) {
        const selectedAmount = event.target.value;
        setAmount(selectedAmount);
        setOrderID(false);
    }

    return (
        <PayPalScriptProvider options={defaultOptions}>
            <div>
                <select onChange={onChange} name="amount" id="amount">
                    <option value="2">$2.00</option>
                    <option value="4">$4.00</option>
                    <option value="6">$6.00</option>
                </select>
                <p>Order ID: {orderID ? orderID : "unknown"}</p>
            </div>
            <PayPalButtons
                {...args}
                createOrder={createOrder}
                forceReRender={amount}
            />
        </PayPalScriptProvider>
    );
}

export const DynamicAmount = DynamicAmountTemplate.bind({});
DynamicAmount.args = {};
