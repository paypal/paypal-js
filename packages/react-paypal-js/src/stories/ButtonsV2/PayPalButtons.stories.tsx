import React, { useEffect, useMemo, useState } from "react";

import { usePayPalScriptReducer, DISPATCH_ACTION } from "../../index";
import { PayPalScriptProvider } from "../../index";
import { getOptionsFromQueryString, generateRandomString } from "../utils";
import { usePayPalButtons } from "../../hooks/usePayPalButtons";

import type { FC, ReactElement } from "react";
import type {
    PayPalScriptOptions,
    PayPalButtonsComponentOptions,
    FUNDING_SOURCE,
    PayPalButtonMessage,
} from "@paypal/paypal-js";

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

export const Default: FC<StoryProps> = ({ showSpinner }) => {
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
    const [amount, setAmount] = useState(100);
    const [, forceUpdate] = useState({});

    async function createOrder(): Promise<string> {
        console.log("count:", count);
        return new Promise((resolve) => setTimeout(() => resolve("1"), 500));
    }

    async function onApprove(data: unknown) {
        console.log("onApprove", data);
    }

    const message: PayPalButtonMessage = useMemo(() => ({ amount }), [amount]);

    const { Buttons, isLoaded, isEligible, hasReturned, resume } =
        usePayPalButtons({
            fundingSource,
            createOrder,
            onApprove,
            message,
            appSwitchWhenAvailable: true,
        });

    const hasReturnedVal = isLoaded && hasReturned();

    useEffect(() => {
        if (isLoaded && hasReturnedVal) {
            resume();
        }
    }, [hasReturnedVal, resume, isLoaded]);

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
            <button
                style={{ margin: "2rem" }}
                onClick={() => setAmount((prev) => prev + 100)}
            >
                Increase amount. Currently: {amount}
            </button>
            <button
                onClick={() => {
                    if (location.hash.includes("onApprove")) {
                        location.hash = "";
                    } else {
                        location.hash = "onApprove";
                    }

                    forceUpdate({});
                }}
            >
                Click me: {location.hash}
            </button>

            {isLoaded && isEligible() && !hasReturned() && (
                <Buttons disabled={disabled} />
            )}
        </>
    );
};
