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
import {
    Buttons,
    useButtons,
    useButtonsWithRef,
    useButtonsWithRefAndButtons,
} from "../../hooks/useButtons";

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

    const [fundingSource, setFundingSource] = useState<
        "paypal" | "venmo" | undefined
    >("paypal");
    const [disabled, setDisabled] = useState(false);
    const [count, setCount] = useState(0);

    async function createOrder(): Promise<string> {
        console.log("count:", count);
        return new Promise((resolve) => setTimeout(() => resolve("1"), 500));
    }

    const { buttons } = useButtons({ fundingSource, createOrder });

    return (
        <>
            {showSpinner && <LoadingSpinner />}
            <button
                style={{ margin: "2rem" }}
                onClick={() =>
                    setFundingSource((prev) =>
                        prev === "paypal"
                            ? "venmo"
                            : prev === "venmo"
                              ? undefined
                              : "paypal",
                    )
                }
            >
                Switch Funding Source. Currently:{" "}
                {fundingSource ?? "undefined (display all)"}
            </button>
            <button
                style={{ margin: "2rem" }}
                onClick={() => setDisabled((prev) => !prev)}
            >
                Set disabled state: Currently: {String(disabled)}
            </button>
            <button
                style={{ margin: "2rem" }}
                onClick={() => setCount((prev) => prev + 1)}
            >
                Increase count. Currently: {count}
            </button>
            <Buttons buttons={buttons} disabled={disabled} />
        </>
    );
};

export const DefaultWithRef: FC<StoryProps> = ({
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

    const [fundingSource, setFundingSource] = useState<
        "paypal" | "venmo" | undefined
    >("paypal");
    const [disabled, setDisabled] = useState(false);
    const [count, setCount] = useState(0);

    async function createOrder(): Promise<string> {
        console.log("count:", count);
        return new Promise((resolve) => setTimeout(() => resolve("1"), 500));
    }

    const { register } = useButtonsWithRef({ fundingSource, createOrder });

    return (
        <>
            {showSpinner && <LoadingSpinner />}
            <button
                style={{ margin: "2rem" }}
                onClick={() =>
                    setFundingSource((prev) =>
                        prev === "paypal"
                            ? "venmo"
                            : prev === "venmo"
                              ? undefined
                              : "paypal",
                    )
                }
            >
                Switch Funding Source. Currently:{" "}
                {fundingSource ?? "undefined (display all)"}
            </button>
            <button
                style={{ margin: "2rem" }}
                onClick={() => setDisabled((prev) => !prev)}
            >
                Set disabled state: Currently: {String(disabled)}
            </button>
            <button
                style={{ margin: "2rem" }}
                onClick={() => setCount((prev) => prev + 1)}
            >
                Increase count. Currently: {count}
            </button>
            <div {...register({ disabled })} />
        </>
    );
};

export const DefaultWithRefAndButtons: FC<StoryProps> = ({
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

    const [fundingSource, setFundingSource] = useState<
        "paypal" | "venmo" | undefined
    >("paypal");
    const [disabled, setDisabled] = useState(false);
    const [count, setCount] = useState(0);

    async function createOrder(): Promise<string> {
        console.log("count:", count);
        return new Promise((resolve) => setTimeout(() => resolve("1"), 500));
    }

    const { Buttons } = useButtonsWithRefAndButtons({
        fundingSource,
        createOrder,
    });

    return (
        <>
            {showSpinner && <LoadingSpinner />}
            <button
                style={{ margin: "2rem" }}
                onClick={() =>
                    setFundingSource((prev) =>
                        prev === "paypal"
                            ? "venmo"
                            : prev === "venmo"
                              ? undefined
                              : "paypal",
                    )
                }
            >
                Switch Funding Source. Currently:{" "}
                {fundingSource ?? "undefined (display all)"}
            </button>
            <button
                style={{ margin: "2rem" }}
                onClick={() => setDisabled((prev) => !prev)}
            >
                Set disabled state: Currently: {String(disabled)}
            </button>
            <button
                style={{ margin: "2rem" }}
                onClick={() => setCount((prev) => prev + 1)}
            >
                Increase count. Currently: {count}
            </button>

            <Buttons disabled={disabled} />
        </>
    );
};
