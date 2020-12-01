import React, { useState } from "react";
import { FUNDING, PayPalScriptProvider, PayPalButtons } from "../index";

const scriptProviderOptions = {
    "client-id": "sb",
    components: "buttons",
};

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
    decorators: [
        (Story) => (
            <PayPalScriptProvider options={scriptProviderOptions}>
                <Story />
            </PayPalScriptProvider>
        ),
    ],
};

export const Default = () => <PayPalButtons />;

export const Horizontal = () => (
    <PayPalButtons style={{ layout: "horizontal" }} />
);

export const CustomStyle = () => (
    <PayPalButtons
        style={{ color: "blue", shape: "pill", label: "pay", height: 40 }}
    />
);

export const Standalone = () => (
    <PayPalButtons fundingSource={FUNDING.PAYPAL} />
);

export const Tiny = () => (
    <div style={{ maxWidth: "80px" }}>
        <PayPalButtons fundingSource={FUNDING.PAYPAL} style={{ height: 25 }} />
    </div>
);

export const DynamicAmount = () => {
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

    function onChange({ target: { value } }) {
        setAmount(value);
        setOrderID(false);
    }

    return (
        <>
            <select onChange={onChange} name="amount" id="amount">
                <option value="2">$2.00</option>
                <option value="4">$4.00</option>
                <option value="6">$6.00</option>
            </select>
            <p>Order ID: {orderID ? orderID : "unknown"}</p>

            <PayPalButtons createOrder={createOrder} forceReRender={amount} />
        </>
    );
};
