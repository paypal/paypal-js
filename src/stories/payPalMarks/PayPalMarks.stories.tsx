import React, { useState, FC, ChangeEvent } from "react";
import type { PayPalScriptOptions } from "@paypal/paypal-js/types/script-options";
import type {
    CreateOrderActions,
    OnApproveData,
    OnApproveActions,
} from "@paypal/paypal-js/types/components/buttons";
import { action } from "@storybook/addon-actions";

import type { PayPalButtonsComponentOptions } from "@paypal/paypal-js/types/components/buttons";
import type { Story } from "@storybook/react";
import type { StoryContext } from "@storybook/addons/dist/ts3.9/types";
import {
    PayPalScriptProvider,
    PayPalMarks,
    PayPalButtons,
    FUNDING,
} from "../../index";
import { getOptionsFromQueryString } from "../utils";
import {
    COMPONENT_PROPS_CATEGORY,
    ARG_TYPE_AMOUNT,
    ARG_TYPE_CURRENCY,
    ORDER_ID,
    APPROVE,
} from "../constants";
import { InEligibleError, defaultProps } from "../commons";
import DocPageStructure from "../components/DocPageStructure";
import { getDefaultCode, getRadioButtonsCode } from "./code";

const scriptProviderOptions: PayPalScriptOptions = {
    "client-id": "test",
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
        amount: ARG_TYPE_AMOUNT,
        currency: ARG_TYPE_CURRENCY,
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
        amount: "2",
        currency: "USD",
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
    amount: string;
    style: PayPalButtonsComponentOptions["style"];
}> = ({ amount, style }) => {
    // Remember the amount props is received from the control panel
    const [selectedFundingSource, setSelectedFundingSource] = useState(
        fundingSources[0]
    );

    function onChange(event: ChangeEvent<HTMLInputElement>) {
        setSelectedFundingSource(event.target.value);
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
                forceReRender={[selectedFundingSource, amount]}
                style={style}
                createOrder={(
                    data: Record<string, unknown>,
                    actions: CreateOrderActions
                ) => {
                    return actions.order
                        .create({
                            purchase_units: [
                                {
                                    amount: {
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
                onApprove={(data: OnApproveData, actions: OnApproveActions) => {
                    return actions.order.capture().then(function (details) {
                        action(APPROVE)(details);
                    });
                }}
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
(Default as Story).parameters = {
    docs: {
        container: ({ context }: { context: StoryContext }) => (
            <DocPageStructure
                context={context}
                code={getDefaultCode(context.args.fundingSource)}
            />
        ),
    },
};

(Default as Story).argTypes = {
    amount: { table: { disable: true } },
    currency: { table: { disable: true } },
    style: { table: { disable: true } },
};

(RadioButtons as Story).parameters = {
    docs: {
        container: ({ context }: { context: StoryContext }) => (
            <DocPageStructure
                context={context}
                code={getRadioButtonsCode(context.args)}
            />
        ),
    },
};

(RadioButtons as Story).argTypes = {
    fundingSource: { control: false },
};
