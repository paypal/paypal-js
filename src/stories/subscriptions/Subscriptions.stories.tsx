import React, { useEffect } from "react";
import { action } from "@storybook/addon-actions";

import {
    PayPalScriptProvider,
    PayPalButtons,
    usePayPalScriptReducer,
    DISPATCH_ACTION,
} from "../../index";
import { getOptionsFromQueryString, generateRandomString } from "../utils";
import {
    ORDER_ID,
    APPROVE,
    SUBSCRIPTION,
    ERROR,
    ORDER_INSTANCE_ERROR,
} from "../constants";
import DocPageStructure from "../components/DocPageStructure";
import { InEligibleError, defaultProps } from "../commons";
import { getDefaultCode } from "./code";

import type { FC, ReactElement } from "react";
import type { StoryFn } from "@storybook/react";
import type { DocsContextProps } from "@storybook/addon-docs";
import type { PayPalButtonsComponentProps } from "../../types/paypalButtonTypes";
import type {
    PayPalScriptOptions,
    CreateSubscriptionActions,
    CreateOrderActions,
    OnApproveData,
    OnApproveActions,
} from "@paypal/paypal-js";

const subscriptionOptions: PayPalScriptOptions = {
    "client-id": "test",
    components: "buttons",
    vault: true,
    ...getOptionsFromQueryString(),
};

const buttonSubscriptionProps = {
    createSubscription(
        data: Record<string, unknown>,
        actions: CreateSubscriptionActions
    ) {
        return actions.subscription
            .create({
                plan_id: PLAN_ID,
            })
            .then((orderId) => {
                action("subscriptionOrder")(orderId);
                return orderId;
            });
    },
    style: {
        label: "subscribe",
    },
    ...defaultProps,
};

const buttonOrderProps = () => ({
    createOrder(data: Record<string, unknown>, actions: CreateOrderActions) {
        return actions.order
            .create({
                purchase_units: [
                    {
                        amount: {
                            value: "2",
                        },
                    },
                ],
            })
            .then((orderId) => {
                action(ORDER_ID)(orderId);
                return orderId;
            });
    },
    onApprove(data: OnApproveData, actions: OnApproveActions) {
        if (!actions.order) {
            action(ERROR)(ORDER_INSTANCE_ERROR);
            return Promise.reject(ORDER_INSTANCE_ERROR);
        }
        return actions.order.capture().then(function (details) {
            action(APPROVE)(details);
        });
    },
    ...defaultProps,
});

const orderOptions: PayPalScriptOptions = {
    "client-id": "test",
    components: "buttons",
    ...getOptionsFromQueryString(),
};

export default {
    id: "example/Subscriptions",
    title: "PayPal/Subscriptions",
    parameters: {
        docs: {
            description: {
                component: `You can use billing plans and subscriptions to create subscriptions that process recurring PayPal payments for physical or digital goods, or services.
A plan includes pricing and billing cycle information that defines the amount and frequency of charge for a subscription.
You can also define a fixed plan, such as a $5 basic plan or a volume or graduated-based plan with pricing tiers based on the quantity purchased.

It relies on the \`<PayPalScriptProvider />\` parent component for managing state related to loading the JS SDK script.
For more information, see [Subscriptions](https://developer.paypal.com/docs/subscriptions/)`,
            },
        },
        controls: { expanded: true },
    },
    argTypes: {
        type: {
            control: "select",
            options: [SUBSCRIPTION, "capture"],
            table: {
                category: "Custom",
                type: { summary: "string" },
                defaultValue: {
                    summary: SUBSCRIPTION,
                },
            },
            description: "Change the PayPal checkout intent.",
        },
    },
    args: {
        type: SUBSCRIPTION,
    },
    decorators: [
        (Story: FC, storyArgs: { args: { type: string } }): ReactElement => {
            const uid = generateRandomString();
            return (
                <PayPalScriptProvider
                    options={{
                        ...subscriptionOptions,
                        "data-namespace": uid,
                        "data-uid": uid,
                        intent: storyArgs.args.type,
                    }}
                >
                    <div style={{ minHeight: "250px" }}>
                        <Story />
                    </div>
                </PayPalScriptProvider>
            );
        },
    ],
};

const PLAN_ID = "P-3RX065706M3469222L5IFM4I";

export const Default: FC<{ type: string }> = ({ type }) => {
    // Remember the type and amount props are received from the control panel
    const [, dispatch] = usePayPalScriptReducer();
    const isSubscription = type === SUBSCRIPTION;
    const buttonOptions = isSubscription
        ? buttonSubscriptionProps
        : buttonOrderProps();
    useEffect(() => {
        dispatch({
            type: DISPATCH_ACTION.RESET_OPTIONS,
            value: type === SUBSCRIPTION ? subscriptionOptions : orderOptions,
        });
    }, [type, dispatch]);

    return (
        <PayPalButtons
            forceReRender={[type]}
            {...(buttonOptions as PayPalButtonsComponentProps)}
            style={{ label: isSubscription ? "subscribe" : undefined }}
        >
            <InEligibleError />
        </PayPalButtons>
    );
};

/********************
 * OVERRIDE STORIES *
 *******************/
(Default as StoryFn).parameters = {
    docs: {
        container: ({ context }: { context: DocsContextProps }) => (
            <DocPageStructure
                context={context}
                code={getDefaultCode(
                    context.getStoryContext(context.storyById(context.id)).args
                        .type
                )}
            />
        ),
    },
};
