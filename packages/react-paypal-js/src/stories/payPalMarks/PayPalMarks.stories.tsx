import React, { useState } from "react";
import { action } from "@storybook/addon-actions";

import {
    PayPalScriptProvider,
    PayPalMarks,
    PayPalButtons,
    FUNDING,
} from "../../index";
import { getOptionsFromQueryString, createOrder, onApprove } from "../utils";
import { COMPONENT_PROPS_CATEGORY, ORDER_ID, APPROVE } from "../constants";
import { InEligibleError, defaultProps } from "../commons";
import DocPageStructure from "../components/DocPageStructure";
import { getDefaultCode, getRadioButtonsCode } from "./code";

import type { FC, ChangeEvent } from "react";
import type { StoryFn } from "@storybook/react";
import type { DocsContextProps } from "@storybook/addon-docs";
import type { PayPalScriptOptions } from "@paypal/paypal-js";
import type {
    PayPalButtonsComponentOptions,
    FUNDING_SOURCE,
} from "@paypal/paypal-js";

const scriptProviderOptions: PayPalScriptOptions = {
    clientId: "test",
    components: "buttons,marks,funding-eligibility",
    ...getOptionsFromQueryString(),
};
const fundingSources = [FUNDING.PAYPAL, FUNDING.CARD, FUNDING.PAYLATER];

export default {
    id: "example/PayPalMarks",
    title: "PayPal/PayPalMarks",
    component: PayPalMarks,
    parameters: {
        options: { showFunctions: true },
        controls: { expanded: true },
    },
    argTypes: {
        style: {
            control: { type: "object" },
            ...COMPONENT_PROPS_CATEGORY,
        },
        className: { control: null, table: { category: "Props" } },
        fundingSource: {
            options: [
                FUNDING.PAYPAL,
                FUNDING.CARD,
                FUNDING.PAYLATER,
                undefined,
            ],
            control: {
                type: "select",
                labels: {
                    [FUNDING.PAYPAL]: "paypal",
                    [FUNDING.CARD]: "card",
                    [FUNDING.PAYLATER]: "paylater",
                    undefined: "all",
                },
            },
            ...COMPONENT_PROPS_CATEGORY,
        },
    },
    args: {
        style: {
            color: "white",
        },
    },
};

export const Default: FC<{ fundingSource: string }> = ({ fundingSource }) => (
    <PayPalScriptProvider options={scriptProviderOptions}>
        <PayPalMarks fundingSource={fundingSource} />
    </PayPalScriptProvider>
);

export const RadioButtons: FC<{
    style: PayPalButtonsComponentOptions["style"];
}> = ({ style }) => {
    const [selectedFundingSource, setSelectedFundingSource] = useState(
        fundingSources[0]
    );

    function onChange(event: ChangeEvent<HTMLInputElement>) {
        setSelectedFundingSource(event.target.value as FUNDING_SOURCE);
    }

    return (
        <PayPalScriptProvider options={scriptProviderOptions}>
            <form style={{ minHeight: "200px" }}>
                {fundingSources.map((fundingSource) => (
                    <label className="mark" key={fundingSource}>
                        <input
                            defaultChecked={
                                fundingSource === selectedFundingSource
                            }
                            onChange={onChange}
                            type="radio"
                            name="fundingSource"
                            value={fundingSource}
                        />
                        <PayPalMarks fundingSource={fundingSource} />
                    </label>
                ))}
            </form>
            <br />
            <PayPalButtons
                fundingSource={selectedFundingSource}
                forceReRender={[selectedFundingSource]}
                style={style}
                createOrder={() =>
                    createOrder([{ sku: "1blwyeo8", quantity: 1 }]).then(
                        (orderData) => {
                            if (orderData.id) {
                                action(ORDER_ID)(orderData.id);
                                return orderData.id;
                            } else {
                                throw new Error("failed to create Order Id");
                            }
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
        </PayPalScriptProvider>
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
                        .fundingSource
                )}
            />
        ),
    },
};

(Default as StoryFn).argTypes = {
    style: { table: { disable: true } },
};

(RadioButtons as StoryFn).parameters = {
    docs: {
        container: ({ context }: { context: DocsContextProps }) => (
            <DocPageStructure
                context={context}
                code={getRadioButtonsCode(
                    context.getStoryContext(context.storyById(context.id)).args
                )}
            />
        ),
    },
};

(RadioButtons as StoryFn).argTypes = {
    fundingSource: { control: false },
};
