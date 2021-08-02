import React, { FunctionComponent, ReactElement, ChangeEvent } from "react";
import type { PayPalScriptOptions } from "@paypal/paypal-js/types/script-options";
import type { CreateSubscriptionActions } from "@paypal/paypal-js/types/components/buttons";

import {
    PayPalScriptProvider,
    PayPalButtons,
    usePayPalScriptReducer,
    DISPATCH_ACTION,
} from "../index";
import { getOptionsFromQueryString, generateRandomString } from "./utils";

const subscriptionOptions: PayPalScriptOptions = {
    "client-id": "test",
    components: "buttons",
    intent: "subscription",
    vault: true,
    ...getOptionsFromQueryString(),
};

const orderOptions: PayPalScriptOptions = {
    "client-id": "test",
    components: "buttons",
    ...getOptionsFromQueryString(),
};

export default {
    title: "Example/Subscriptions",
    decorators: [
        (Story: FunctionComponent): ReactElement => (
            <PayPalScriptProvider
                options={{
                    ...subscriptionOptions,
                    "data-namespace": generateRandomString(),
                }}
            >
                <div style={{ minHeight: "250px" }}>
                    <Story />
                </div>
            </PayPalScriptProvider>
        ),
    ],
};

const PLAN_ID = "P-3RX065706M3469222L5IFM4I";

export const Default: FunctionComponent = () => (
    <PayPalButtons
        createSubscription={(
            data: Record<string, unknown>,
            actions: CreateSubscriptionActions
        ) =>
            actions.subscription.create({
                plan_id: PLAN_ID,
            })
        }
        style={{
            label: "subscribe",
        }}
    />
);

export const OrdersAndSubscriptions: FunctionComponent = () => {
    const [{ options }, dispatch] = usePayPalScriptReducer();

    const buttonSubscriptionOptions = {
        createSubscription(
            data: Record<string, unknown>,
            actions: CreateSubscriptionActions
        ) {
            return actions.subscription.create({
                plan_id: PLAN_ID,
            });
        },
        style: {
            label: "subscribe",
        },
    };

    const buttonOptions =
        options.intent === "subscription" ? buttonSubscriptionOptions : {};

    function onChange(event: ChangeEvent<HTMLInputElement>) {
        dispatch({
            type: DISPATCH_ACTION.RESET_OPTIONS,
            value:
                event.target.value === "subscription"
                    ? subscriptionOptions
                    : orderOptions,
        });
    }

    return (
        <>
            <form>
                <label>
                    <input
                        defaultChecked
                        onChange={onChange}
                        type="radio"
                        name="type"
                        value="subscription"
                    />
                    Subscription
                </label>
                <label>
                    <input
                        onChange={onChange}
                        type="radio"
                        name="type"
                        value="order"
                    />
                    Order
                </label>
            </form>
            <br />
            <PayPalButtons {...buttonOptions} />
        </>
    );
};
