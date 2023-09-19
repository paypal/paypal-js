import React, { useEffect } from "react";
import { action } from "@storybook/addon-actions";

import { usePayPalScriptReducer, DISPATCH_ACTION } from "../../index";
import { PayPalScriptProvider, PayPalButtons, FUNDING } from "../../index";
import {
    getOptionsFromQueryString,
    generateRandomString,
    createOrder,
    onApprove,
} from "../utils";
import {
    COMPONENT_PROPS_CATEGORY,
    COMPONENT_EVENTS,
    FUNDING_SOURCE_ARG,
    ORDER_ID,
    CONTAINER_SIZE,
    APPROVE,
} from "../constants";
import DocPageStructure from "../components/DocPageStructure";
import { InEligibleError, defaultProps } from "../commons";
import { getDefaultCode, getDonateCode } from "./code";

import type { FC, ReactElement } from "react";
import type {
    PayPalScriptOptions,
    PayPalButtonsComponentOptions,
    FUNDING_SOURCE,
} from "@paypal/paypal-js";
import type { StoryFn } from "@storybook/react";
import type { DocsContextProps } from "@storybook/addon-docs";

type StoryProps = {
    style: PayPalButtonsComponentOptions["style"];
    fundingSource: FUNDING_SOURCE;
    disabled: boolean;
    showSpinner: boolean;
};

const scriptProviderOptions: PayPalScriptOptions = {
    clientId: "test",
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
        onShippingAddressChange: { table: { category: COMPONENT_EVENTS } },
        onShippingOptionsChange: { table: { category: COMPONENT_EVENTS } },
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
                            dataNamespace: uid,
                            dataUid: uid,
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
    showSpinner,
}) => {
    const [{ options }, dispatch] = usePayPalScriptReducer();
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
                forceReRender={[style]}
                createOrder={() =>
                    createOrder([{ sku: "1blwyeo8", quantity: 1 }]).then(
                        (orderData) => {
                            action(ORDER_ID)(orderData.id);
                            return orderData.id;
                        }
                    )
                }
                onApprove={(data) =>
                    onApprove(data).then((orderData) =>
                        action(APPROVE)(orderData)
                    )
                }
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
}) => (
    <PayPalButtons
        fundingSource={FUNDING.PAYPAL}
        forceReRender={[style]}
        disabled={disabled}
        style={{ ...style, label: "donate" }}
        createOrder={() =>
            createOrder([{ sku: "etanod01", quantity: 1 }]).then(
                (orderData) => {
                    action(ORDER_ID)(orderData.id);
                    return orderData.id;
                }
            )
        }
        onApprove={(data) =>
            onApprove(data).then((orderData) => action(APPROVE)(orderData))
        }
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
                code={getDefaultCode(
                    context.getStoryContext(context.storyById(context.id)).args
                )}
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
                code={getDonateCode(
                    context.getStoryContext(context.storyById(context.id)).args
                )}
            />
        ),
    },
};

// Override the Donate story controls table props
(Donate as StoryFn).argTypes = {
    fundingSource: { control: false },
    showSpinner: { table: { disable: true } },
};
