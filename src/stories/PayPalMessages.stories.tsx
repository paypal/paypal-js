import React, { FunctionComponent, ReactElement } from "react";
import type { PayPalScriptOptions } from "@paypal/paypal-js/types/script-options";

import { PayPalScriptProvider, PayPalMessages } from "../index";
import { getOptionsFromQueryString } from "./utils";

const scriptProviderOptions: PayPalScriptOptions = {
    "client-id": "test",
    components: "messages",
    ...getOptionsFromQueryString(),
};

export default {
    title: "Example/PayPalMessages",
    component: PayPalMessages,
    decorators: [
        (Story: FunctionComponent): ReactElement => (
            <PayPalScriptProvider options={scriptProviderOptions}>
                <div style={{ minHeight: "250px" }}>
                    <Story />
                </div>
            </PayPalScriptProvider>
        ),
    ],
};

export const Default: FunctionComponent = () => <PayPalMessages />;

export const Flex: FunctionComponent = () => (
    <PayPalMessages style={{ layout: "flex" }} />
);
