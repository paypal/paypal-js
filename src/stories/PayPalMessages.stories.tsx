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
                <Story />
            </PayPalScriptProvider>
        ),
    ],
};

export const Default: FunctionComponent = () => <PayPalMessages />;

export const Flex: FunctionComponent = () => (
    <PayPalMessages style={{ layout: "flex" }} />
);
