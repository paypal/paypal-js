import React from "react";
import { PayPalScriptProvider, PayPalMessages } from "../index";
import { getOptionsFromQueryString } from "./utils";

const scriptProviderOptions = {
    "client-id": "test",
    components: "messages",
    ...getOptionsFromQueryString(),
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
