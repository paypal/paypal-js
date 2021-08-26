import React, { useState, useEffect, ReactElement } from "react";
import type { FC } from "react";

import type { PayPalScriptOptions } from "@paypal/paypal-js/types/script-options";
import type {
    CreateOrderBraintreeActions,
    OnApproveBraintreeActions,
    OnApproveBraintreeData,
} from "../types";

import { PayPalScriptProvider } from "../index";
import { BraintreePayPalButtons } from "../components/braintree/BraintreePayPalButtons";
import {
    getOptionsFromQueryString,
    generateRandomString,
    getClientToken,
    approveSale,
} from "./utils";

const AMOUNT = "10.0";
const scriptProviderOptions: PayPalScriptOptions = {
    "client-id": "test",
    components: "buttons",
    ...getOptionsFromQueryString(),
};

export default {
    title: "Example/BraintreePayPalButtons",
    component: BraintreePayPalButtons,
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
        (Story: FC): ReactElement => {
            // Workaround to render the story after got the client token,
            // The new experimental loaders doesn't work in Docs views
            const [clientToken, setClientToken] = useState<string | null>(null);

            useEffect(() => {
                (async () => {
                    setClientToken(await getClientToken());
                })();
            }, []);

            return (
                <div style={{ minHeight: "200px" }}>
                    {clientToken != null && (
                        <>
                            <PayPalScriptProvider
                                options={{
                                    ...scriptProviderOptions,
                                    "data-client-token": clientToken,
                                    "data-namespace": generateRandomString(),
                                }}
                            >
                                <Story />
                            </PayPalScriptProvider>
                        </>
                    )}
                </div>
            );
        },
    ],
};

export const Default: FC = () => {
    return (
        <BraintreePayPalButtons
            createOrder={(
                data: Record<string, unknown>,
                actions: CreateOrderBraintreeActions
            ) =>
                actions.braintree.createPayment({
                    flow: "checkout",
                    amount: AMOUNT,
                    currency: "USD",
                    intent: "capture",
                    enableShippingAddress: true,
                    shippingAddressEditable: false,
                    shippingAddressOverride: {
                        recipientName: "Scruff McGruff",
                        line1: "1234 Main St.",
                        line2: "Unit 1",
                        city: "Chicago",
                        countryCode: "US",
                        postalCode: "60652",
                        state: "IL",
                        phone: "123.456.7890",
                    },
                })
            }
            onApprove={(
                data: OnApproveBraintreeData,
                actions: OnApproveBraintreeActions
            ) =>
                actions.braintree.tokenizePayment(data).then((payload) => {
                    approveSale(payload.nonce, AMOUNT).then((data) => {
                        alert(JSON.stringify(data));
                        // Call server-side endpoint to finish the sale
                    });
                })
            }
        />
    );
};
