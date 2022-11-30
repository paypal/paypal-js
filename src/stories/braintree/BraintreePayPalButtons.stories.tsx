import React, { useState, useEffect, ReactElement } from "react";
import { action } from "@storybook/addon-actions";

import { PayPalScriptProvider } from "../../index";
import { BraintreePayPalButtons } from "../../components/braintree/BraintreePayPalButtons";
import {
    getOptionsFromQueryString,
    generateRandomString,
    getClientToken,
    approveSale,
} from "../utils";
import {
    COMPONENT_PROPS_CATEGORY,
    COMPONENT_EVENTS,
    ARG_TYPE_AMOUNT,
    ARG_TYPE_CURRENCY,
    FUNDING_SOURCE_ARG,
    ORDER_ID,
    CONTAINER_SIZE,
    APPROVE,
} from "../constants";
import DocPageStructure from "../components/DocPageStructure";
import { InEligibleError, defaultProps } from "../commons";
import { getDefaultCode, getBillingAgreementCode } from "./code";

import type { FC } from "react";
import type {
    PayPalScriptOptions,
    PayPalButtonsComponentOptions,
    FUNDING_SOURCE,
} from "@paypal/paypal-js";
import type { StoryFn } from "@storybook/react";
import type { DocsContextProps } from "@storybook/addon-docs";
import type {
    CreateOrderBraintreeActions,
    OnApproveBraintreeActions,
    OnApproveBraintreeData,
} from "../../types";

type StoryProps = {
    style: PayPalButtonsComponentOptions["style"];
    fundingSource: FUNDING_SOURCE;
    disabled: boolean;
    amount: string;
    currency: string;
};

const uid = generateRandomString();
const scriptProviderOptions: PayPalScriptOptions = {
    "client-id": "test",
    components: "buttons",
    ...getOptionsFromQueryString(),
};

export default {
    title: "Braintree/BraintreePayPalButtons",
    component: BraintreePayPalButtons,
    parameters: {
        controls: { expanded: true, sort: "requiredFirst" },
    },
    argTypes: {
        amount: ARG_TYPE_AMOUNT,
        currency: ARG_TYPE_CURRENCY,
        size: CONTAINER_SIZE,
        style: {
            control: { type: "object", expanded: true },
            ...COMPONENT_PROPS_CATEGORY,
        },
        disabled: {
            options: [true, false],
            control: { type: "select" },
            ...COMPONENT_PROPS_CATEGORY,
        },
        forceReRender: { control: false, ...COMPONENT_PROPS_CATEGORY },
        className: { control: false, ...COMPONENT_PROPS_CATEGORY },
        children: { control: false, ...COMPONENT_PROPS_CATEGORY },
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
        style: {
            label: "paypal",
            layout: "vertical",
        },
        disabled: false,
    },
    decorators: [
        (
            Story: FC,
            storyArg: {
                args: { size: number };
                originalStoryFn: { name: string };
            }
        ): ReactElement => {
            // Workaround to render the story after got the client token,
            // The new experimental loaders doesn't work in Docs views
            const [clientToken, setClientToken] = useState<string | null>(null);
            const isBillingAggrement =
                storyArg.originalStoryFn.name === BillingAgreement.name;

            useEffect(() => {
                (async () => {
                    setClientToken(await getClientToken());
                })();
            }, []);

            return (
                <div style={{ maxWidth: `${storyArg.args.size}%` }}>
                    {clientToken !== null && (
                        <div style={{ maxWidth: `${storyArg.args.size}px` }}>
                            <PayPalScriptProvider
                                options={{
                                    ...scriptProviderOptions,
                                    "data-client-token": clientToken,
                                    "data-namespace": uid,
                                    "data-uid": uid,
                                    intent: isBillingAggrement
                                        ? "tokenize"
                                        : "capture",
                                    vault: isBillingAggrement,
                                }}
                            >
                                <Story />
                            </PayPalScriptProvider>
                        </div>
                    )}
                </div>
            );
        },
    ],
};

export const Default: FC<StoryProps> = ({
    style,
    fundingSource,
    disabled,
    amount,
    currency,
}) => {
    // Remember all the arguments props are received from the control panel below
    return (
        <BraintreePayPalButtons
            style={style}
            disabled={disabled}
            fundingSource={fundingSource}
            forceReRender={[style, amount, currency]}
            createOrder={(
                data: Record<string, unknown>,
                actions: CreateOrderBraintreeActions
            ) =>
                actions.braintree
                    .createPayment({
                        flow: "checkout",
                        amount: amount,
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
                    .then((orderId) => {
                        action(ORDER_ID)(orderId);
                        return orderId;
                    })
            }
            onApprove={(
                data: OnApproveBraintreeData,
                actions: OnApproveBraintreeActions
            ) =>
                actions.braintree.tokenizePayment(data).then((payload) => {
                    approveSale(payload.nonce, amount).then((data) => {
                        action(APPROVE)(data);
                        // Call server-side endpoint to finish the sale
                    });
                })
            }
            {...defaultProps}
        >
            <InEligibleError />
        </BraintreePayPalButtons>
    );
};

export const BillingAgreement: FC<StoryProps> = ({
    style,
    fundingSource,
    disabled,
    amount,
}) => {
    return (
        <BraintreePayPalButtons
            style={style}
            disabled={disabled}
            fundingSource={fundingSource}
            forceReRender={[style, amount]}
            createBillingAgreement={(data, actions) =>
                actions.braintree.createPayment({
                    flow: "vault", // Required

                    // The following are optional params
                    billingAgreementDescription: "Your agreement description",
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
            onApprove={(data, actions) =>
                actions.braintree
                    .tokenizePayment(data as OnApproveBraintreeData)
                    .then((payload) => {
                        approveSale(payload.nonce, amount).then((data) => {
                            action(APPROVE)(data);
                            // Call server-side endpoint to finish the sale
                        });
                    })
            }
            {...defaultProps}
        >
            <InEligibleError />
        </BraintreePayPalButtons>
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
                )}
            />
        ),
    },
};

(BillingAgreement as StoryFn).parameters = {
    docs: {
        container: ({ context }: { context: DocsContextProps }) => (
            <DocPageStructure
                context={context}
                code={getBillingAgreementCode(
                    context.getStoryContext(context.storyById(context.id)).args
                )}
            />
        ),
    },
};

(BillingAgreement as StoryFn).argTypes = {
    amount: { table: { disable: true } },
    currency: { table: { disable: true } },
};
