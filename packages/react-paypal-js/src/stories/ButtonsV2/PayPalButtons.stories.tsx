import React, { useEffect, useState } from "react";
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

import type { FC, ReactElement } from "react";
import type {
    PayPalScriptOptions,
    PayPalButtonsComponentOptions,
    FUNDING_SOURCE,
} from "@paypal/paypal-js";
import type { StoryFn } from "@storybook/react";
import type { DocsContextProps } from "@storybook/addon-docs";
import { Buttons, useButtons } from "../../hooks/useButtons";

type StoryProps = {
    style: PayPalButtonsComponentOptions["style"];
    message: PayPalButtonsComponentOptions["message"];
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
    id: "example/PayPalButtonsV2",
    title: "PayPal/PayPalButtonsV2",
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
    //style,
    //message,
    //fundingSource,
    //disabled,
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

    const { isLoaded, buttons } = useButtons({});

    console.log("istance", buttons);

    return (
        <>
            {showSpinner && <LoadingSpinner />}
            {isLoaded && <Buttons buttons={buttons} />}
        </>
    );
};
