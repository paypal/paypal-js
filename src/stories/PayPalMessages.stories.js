import React from "react";
import { PayPalScriptProvider, PayPalMessages } from "../index";

const scriptProviderOptions = {
    "client-id": "sb",
    components: "messages",
};

export default {
    title: "Example/PayPalMessages",
    component: PayPalMessages,
    decorators: [
        (Story) => (
            <PayPalScriptProvider options={scriptProviderOptions}>
                <Story />
            </PayPalScriptProvider>
        ),
    ],
};

export const Default = () => <PayPalMessages />;

export const Flex = () => <PayPalMessages style={{ layout: "flex" }} />;
