import React, { FC, ReactElement, useEffect } from "react";
import type {
    PayPalScriptOptions,
    CreateOrderActions,
    OnApproveActions,
    PayPalButtonsComponentOptions,
} from "@paypal/paypal-js";
import type { StoryFn } from "@storybook/react";
import type { DocsContextProps } from "@storybook/addon-docs";

import { usePayPalScriptReducer, DISPATCH_ACTION } from "../../index";
import { action } from "@storybook/addon-actions";
import { PayPalScriptProvider, PayPalButtons, FUNDING } from "../../index";
import { getOptionsFromQueryString, generateRandomString } from "../utils";
import {
    COMPONENT_PROPS_CATEGORY,
    COMPONENT_EVENTS,
    ARG_TYPE_CURRENCY,
    ARG_TYPE_AMOUNT,
    FUNDING_SOURCE_ARG,
    ORDER_ID,
    CONTAINER_SIZE,
    APPROVE,
    ERROR,
    ORDER_INSTANCE_ERROR,
} from "../constants";
import DocPageStructure from "../components/DocPageStructure";
import { InEligibleError, defaultProps } from "../commons";
import { getDefaultCode, getDonateCode } from "./code";

type StoryProps = {
    style: PayPalButtonsComponentOptions["style"];
    fundingSource: string;
    disabled: boolean;
    currency: string;
    amount: string;
    showSpinner: boolean;
};

const scriptProviderOptions: PayPalScriptOptions = {
    "client-id": "test",
    components: "buttons",
    ...getOptionsFromQueryString(),
};

const LoadingSpinner: FC = () => {
    const [{ isPending }] = usePayPalScriptReducer();

    return isPending ? <div className="spinner" /> : null;
};

export default {
    id: "example/PayPalButtons",
    title: "PayPal/PayPalButtons",
    component: PayPalButtons,
    parameters: {
        controls: { expanded: true, sort: "requiredFirst" },
    },
    argTypes: {
        currency: ARG_TYPE_CURRENCY,
        amount: ARG_TYPE_AMOUNT,
        size: CONTAINER_SIZE,
        showSpinner: {
            description:
                "This is not a property from PayPalButtons. It is custom control to show or not a spinner when PayPal SDK is loading.",
            options: [true, false],
            control: { type: "select" },
            table: {
                defaultValue: {
                    summary: "false",
                },
                category: "Custom",
                type: { summary: "boolean" },
            },
        },
        style: {
            control: { type: "object" },
            ...COMPONENT_PROPS_CATEGORY,
        },
        disabled: {
            options: [true, false],
            control: { type: "select" },
            ...COMPONENT_PROPS_CATEGORY,
        },
        forceReRender: { control: false, ...COMPONENT_PROPS_CATEGORY },
        className: { control: false, ...COMPONENT_PROPS_CATEGORY },
        children: { table: { disable: true } },
        fundingSource: FUNDING_SOURCE_ARG,
        createOrder: { table: { category: COMPONENT_EVENTS } },
        createBillingAgreement: { table: { category: COMPONENT_EVENTS } },
        createSubscription: { table: { category: COMPONENT_EVENTS } },
        onShippingChange: { table: { category: COMPONENT_EVENTS } },
        onApprove: { table: { category: COMPONENT_EVENTS } },
        onCancel: { table: { category: COMPONENT_EVENTS } },
        onClick: { table: { category: COMPONENT_EVENTS } },
        onInit: { table: { category: COMPONENT_EVENTS } },
        onError: { table: { category: COMPONENT_EVENTS } },
    },
    args: {
        // Storybook passes empty functions by default for props like `onShippingChange`.
        // This turns on the `onShippingChange()` feature which uses the popup experience with the Standard Card button.
        // We pass null to opt-out so the inline guest feature works as expected with the Standard Card button.
        onShippingChange: null,
        amount: "2",
        currency: "USD",
        size: 750,
        showSpinner: false,
        style: {
            layout: "vertical",
        },
        disabled: false,
    },
    decorators: [
        (Story: FC, storyArg: { args: { size: number } }): ReactElement => {
            const uid = generateRandomString();

            return (
                <div
                    style={{
                        maxWidth: `${storyArg.args.size}px`,
                        minHeight: "200px",
                    }}
                >
                    <PayPalScriptProvider
                        options={{
                            ...scriptProviderOptions,
                            "data-namespace": uid,
                            "data-uid": uid,
                        }}
                    >
                        <Story />
                    </PayPalScriptProvider>
                </div>
            );
        },
    ],
};

export const Default: FC<StoryProps> = ({
    style,
    fundingSource,
    disabled,
    currency,
    amount,
    showSpinner,
}) => {
    const [{ options }, dispatch] = usePayPalScriptReducer();

    useEffect(() => {
        dispatch({
            type: DISPATCH_ACTION.RESET_OPTIONS,
            value: {
                ...options,
                currency: currency,
            },
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currency]);

    useEffect(() => {
        dispatch({
            type: DISPATCH_ACTION.RESET_OPTIONS,
            value: {
                ...options,
                "data-order-id": Date.now().toString(),
            },
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [showSpinner]);

    return (
        <>
            {showSpinner && <LoadingSpinner />}
            <PayPalButtons
                style={style}
                disabled={disabled}
                fundingSource={fundingSource}
                forceReRender={[style, currency, amount]}
                createOrder={(
                    data: Record<string, unknown>,
                    actions: CreateOrderActions
                ) => {
                    return actions.order
                        .create({
                            purchase_units: [
                                {
                                    amount: {
                                        currency_code: currency,
                                        value: amount,
                                    },
                                },
                            ],
                        })
                        .then((orderId) => {
                            action(ORDER_ID)(orderId);
                            return orderId;
                        });
                }}
                onApprove={(_, actions: OnApproveActions) => {
                    if (!actions.order) {
                        action(ERROR)(ORDER_INSTANCE_ERROR);
                        return Promise.reject(ORDER_INSTANCE_ERROR);
                    }
                    return actions.order.capture().then(function (details) {
                        action(APPROVE)(details);
                    });
                }}
                {...defaultProps}
            >
                <InEligibleError />
            </PayPalButtons>
        </>
    );
};

export const Donate: FC<Omit<StoryProps, "showSpinner" | "fundingSource">> = ({
    style,
    disabled,
    currency,
    amount,
}) => (
    <PayPalButtons
        fundingSource={FUNDING.PAYPAL}
        forceReRender={[style, currency, amount]}
        disabled={disabled}
        style={{ ...style, label: "donate" }}
        createOrder={(data, actions) => {
            return actions.order
                .create({
                    purchase_units: [
                        {
                            amount: {
                                value: amount,
                                breakdown: {
                                    item_total: {
                                        currency_code: currency,
                                        value: amount,
                                    },
                                },
                            },
                            items: [
                                {
                                    name: "donation-example",
                                    quantity: "1",
                                    unit_amount: {
                                        currency_code: currency,
                                        value: amount,
                                    },
                                    category: "DONATION",
                                },
                            ],
                        },
                    ],
                })
                .then((orderId) => {
                    action(ORDER_ID)(orderId);
                    return orderId;
                });
        }}
    >
        <InEligibleError />
    </PayPalButtons>
);

/********************
 * OVERRIDE STORIES *
 *******************/
(Default as StoryFn).parameters = {
    docs: {
        container: ({ context }: { context: DocsContextProps }) => (
            <DocPageStructure
                context={context}
                code={getDefaultCode(context.args || {})}
            />
        ),
    },
};

// Override the Donate story code snippet
(Donate as StoryFn).parameters = {
    docs: {
        container: ({ context }: { context: DocsContextProps }) => (
            <DocPageStructure
                context={context}
                code={getDonateCode(context.args || {})}
            />
        ),
    },
};

// Override the Donate story controls table props
(Donate as StoryFn).argTypes = {
    fundingSource: { control: false },
    showSpinner: { table: { disable: true } },
};
