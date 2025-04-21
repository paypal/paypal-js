import React, { useEffect } from "react";

import { usePayPalScriptReducer, DISPATCH_ACTION } from "../../index";
import { COMPONENT_PROPS_CATEGORY, FUNDING_SOURCE_ARG } from "../constants";
import { PayPalScriptProvider } from "../../index";
import { getOptionsFromQueryString, generateRandomString } from "../utils";
import { usePayPalButtons } from "../../hooks/usePayPalButtons";

import type { FC, ReactElement } from "react";
import type {
    PayPalScriptOptions,
    PayPalButtonsComponentOptions,
    FUNDING_SOURCE,
} from "@paypal/paypal-js";

type StoryProps = {
    style: PayPalButtonsComponentOptions["style"];
    message: PayPalButtonsComponentOptions["message"];
    fundingSource: FUNDING_SOURCE;
    disabled: boolean;
    showSpinner: boolean;
    appSwitchWhenAvailable: boolean;
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
    parameters: {
        controls: { expanded: true, sort: "requiredFirst" },
    },
    argTypes: {
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
        message: {
            control: { type: "object" },
            ...COMPONENT_PROPS_CATEGORY,
        },
        disabled: {
            options: [true, false],
            control: { type: "select" },
            ...COMPONENT_PROPS_CATEGORY,
        },
        fundingSource: FUNDING_SOURCE_ARG,
        appSwitchWhenAvailable: {
            options: [true, false],
            control: { type: "select" },
            ...COMPONENT_PROPS_CATEGORY,
        },
        style: {
            control: { type: "object" },
            ...COMPONENT_PROPS_CATEGORY,
        },
        sdkBaseUrl: {
            control: { type: "text" },
            ...COMPONENT_PROPS_CATEGORY,
        },
        clientID: {
            control: { type: "text" },
            ...COMPONENT_PROPS_CATEGORY,
        },
    },
    args: {
        style: {
            layout: "vertical",
        },
        disabled: false,
        showSpinner: false,
    },
    decorators: [
        (
            Story: FC,
            storyArg: {
                args: { size: number; sdkBaseUrl?: string; clientID?: string };
            },
        ): ReactElement => {
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
                            clientId:
                                storyArg.args.clientID ??
                                scriptProviderOptions.clientId,
                            sdkBaseUrl: storyArg.args.sdkBaseUrl,
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
    showSpinner,
    fundingSource,
    disabled,
    message,
    appSwitchWhenAvailable,
    style,
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

    async function createOrder(): Promise<string> {
        return new Promise((resolve) => setTimeout(() => resolve("1"), 500));
    }

    async function onApprove(data: unknown) {
        console.log("onApprove", data);
    }

    const { Buttons, isLoaded, isEligible, hasReturned, resume } =
        usePayPalButtons({
            fundingSource,
            createOrder,
            onApprove,
            message,
            appSwitchWhenAvailable,
            style,
        });

    const hasReturnedVal = isLoaded && hasReturned();

    useEffect(() => {
        if (isLoaded && hasReturnedVal) {
            resume();
        }
    }, [hasReturnedVal, resume, isLoaded]);

    if (isLoaded && !isEligible()) {
        return <p>Funding source: {fundingSource} is not eligible</p>;
    }

    return (
        <>
            {showSpinner && <LoadingSpinner />}
            {isLoaded && isEligible() && !hasReturned() && (
                <Buttons disabled={disabled} />
            )}
        </>
    );
};
