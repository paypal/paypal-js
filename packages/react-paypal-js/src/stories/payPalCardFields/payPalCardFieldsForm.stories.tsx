import React, { useState } from "react";
import { action } from "@storybook/addon-actions";

import {
    PayPalScriptProvider,
    usePayPalCardFields,
    PayPalCardFieldsProvider,
    PayPalCardFieldsForm,
} from "../../index";
import {
    getOptionsFromQueryString,
    generateRandomString,
    CREATE_ORDER_URL,
    CAPTURE_ORDER_URL,
} from "../utils";
import { ORDER_ID, ERROR } from "../constants";
import DocPageStructure from "../components/DocPageStructure";
import { getFormCode } from "./code";

import type { DocsContextProps } from "@storybook/addon-docs";
import type { StoryFn } from "@storybook/react";
import type { FC } from "react";
import type {
    CardFieldsOnApproveData,
    PayPalScriptOptions,
} from "@paypal/paypal-js";

const uid = generateRandomString();

const scriptProviderOptions: PayPalScriptOptions = {
    clientId:
        "AduyjUJ0A7urUcWtGCTjanhRBSzOSn9_GKUzxWDnf51YaV1eZNA0ZAFhebIV_Eq-daemeI7dH05KjLWm",
    components: "card-fields",
    ...getOptionsFromQueryString(),
};
const CREATE_ORDER = "createOrder";
const SUBMIT_FORM = "submitForm";
const CAPTURE_ORDER = "captureOrder";

/**
 * Functional component to submit the card fields form
 */

const SubmitPayment: React.FC<{
    isPaying: boolean;
    setIsPaying: React.Dispatch<React.SetStateAction<boolean>>;
}> = ({ isPaying, setIsPaying }) => {
    const { cardFieldsForm } = usePayPalCardFields();

    const handleClick = async () => {
        if (!cardFieldsForm) {
            const childErrorMessage =
                "Unable to find any child components in the <PayPalCardFieldsProvider />";

            action(ERROR)(childErrorMessage);
            throw new Error(childErrorMessage);
        }
        const formState = await cardFieldsForm.getState();

        if (!formState.isFormValid) {
            return alert("The payment form is invalid");
        }
        action(SUBMIT_FORM)("Form is valid and submitted");
        setIsPaying(true);

        cardFieldsForm.submit().catch((err) => {
            action(ERROR)(err.message);
            setIsPaying(false);
        });
    };

    return (
        <button
            className={`btn${isPaying ? "" : " btn-primary"}`}
            style={{ float: "right" }}
            onClick={handleClick}
        >
            {isPaying ? <div className="spinner tiny" /> : "Pay"}
        </button>
    );
};

export default {
    title: "PayPal/PayPalCardFields/Form",
    component: PayPalCardFieldsForm,
    parameters: {
        controls: { expanded: true, sort: "requiredFirst" },
        docs: {
            source: { language: "tsx" },
        },
    },
    argTypes: {
        className: {
            control: false,
            table: { category: "Props", type: { summary: "string?" } },
            description:
                "Classes applied to the form container, not the individual fields.",
            defaultValue: {
                summary: "undefined",
            },
        },
    },
};

export const Default: FC = () => {
    const [isPaying, setIsPaying] = useState(false);
    async function createOrder() {
        action(CREATE_ORDER)("Start creating the order in custom endpoint");
        return fetch(CREATE_ORDER_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                cart: [
                    {
                        sku: "1blwyeo8",
                        quantity: 2,
                    },
                ],
            }),
        })
            .then((response) => response.json())
            .then((order) => {
                action(CREATE_ORDER)(order);
                return order.id;
            })
            .catch((err) => {
                action(ERROR)(err.message);
                console.error(err);
            });
    }

    function onApprove(data: CardFieldsOnApproveData) {
        action(`Received ${ORDER_ID}`)(data.orderID);
        action(CAPTURE_ORDER)(
            `Sending ${ORDER_ID} to custom endpoint to capture the payment information`,
        );
        fetch(CAPTURE_ORDER_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ orderID: data.orderID }),
        })
            .then((response) => response.json())
            .then((data) => {
                action(CAPTURE_ORDER)(data);
                setIsPaying(false);
            })
            .catch((err) => {
                action(ERROR)(err.message);
            });
    }
    return (
        <PayPalScriptProvider
            options={{
                ...scriptProviderOptions,

                dataNamespace: uid,
                dataUid: uid,
            }}
        >
            <PayPalCardFieldsProvider
                createOrder={createOrder}
                onApprove={onApprove}
                onError={(err) => {
                    console.log(err);
                }}
            >
                <PayPalCardFieldsForm />
                {/* Custom client component to handle card fields submit */}
                <SubmitPayment isPaying={isPaying} setIsPaying={setIsPaying} />
            </PayPalCardFieldsProvider>
        </PayPalScriptProvider>
    );
};

/********************
 * OVERRIDE STORIES *
 *******************/
(Default as StoryFn).parameters = {
    docs: {
        container: ({ context }: { context: DocsContextProps }) => (
            <DocPageStructure context={context} code={getFormCode()} />
        ),
    },
};

export const WithDynamicOrderState: FC = () => {
    const [count, setCount] = useState(0);
    const [providerTableCounts, setProviderTableCounts] = useState(
        new Array(6).fill(count),
    );
    const [isPaying, setIsPaying] = useState(false);

    const updateProviderTableCount = (index: number, count: number) => {
        const newProviderTableCounts = [...providerTableCounts];
        newProviderTableCounts[index] = count;
        setProviderTableCounts(newProviderTableCounts);
    };

    async function createOrder() {
        updateProviderTableCount(0, count);
        action(CREATE_ORDER)("Start creating the order in custom endpoint");
        return fetch(CREATE_ORDER_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                cart: [
                    {
                        sku: "1blwyeo8",
                        quantity: count,
                    },
                ],
            }),
        })
            .then((response) => response.json())
            .then((order) => {
                action(CREATE_ORDER)(order);
                return order.id;
            })
            .catch((err) => {
                action(ERROR)(err.message);
                console.error(err);
            });
    }

    function onApprove(data: CardFieldsOnApproveData) {
        updateProviderTableCount(1, count);
        action(`Received ${ORDER_ID}`)(data.orderID);
        action(CAPTURE_ORDER)(
            `Sending ${ORDER_ID} to custom endpoint to capture the payment information`,
        );
        fetch(CAPTURE_ORDER_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ orderID: data.orderID }),
        })
            .then((response) => response.json())
            .then((data) => {
                action(CAPTURE_ORDER)(data);
                setIsPaying(false);
            })
            .catch((err) => {
                action(ERROR)(err.message);
            });
    }

    const tableStyles = {
        borderCollapse: "collapse",
        border: "1px solid black",
        width: "100%",
        textAlign: "center",
    } as React.CSSProperties;

    const columnStyles = {
        border: "1px solid black",
    } as React.CSSProperties;

    return (
        <>
            <button onClick={() => setCount(count + 1)}>Count: {count}</button>
            <PayPalScriptProvider
                options={{
                    ...scriptProviderOptions,

                    dataNamespace: uid,
                    dataUid: uid,
                }}
            >
                <PayPalCardFieldsProvider
                    createOrder={createOrder}
                    onApprove={onApprove}
                    onError={(err) => {
                        console.log(err);
                    }}
                    inputEvents={{
                        onChange: () => updateProviderTableCount(2, count),
                        onFocus: () => updateProviderTableCount(3, count),
                        onBlur: () => updateProviderTableCount(4, count),
                        onInputSubmitRequest: () =>
                            updateProviderTableCount(5, count),
                    }}
                >
                    <PayPalCardFieldsForm />
                    {/* Custom client component to handle card fields submit */}
                    <SubmitPayment
                        isPaying={isPaying}
                        setIsPaying={setIsPaying}
                    />
                </PayPalCardFieldsProvider>
            </PayPalScriptProvider>
            <section>
                <h2>Count state on Provider Callbacks and input events</h2>
                <table style={tableStyles}>
                    <thead>
                        <tr>
                            <th style={columnStyles} scope="col">
                                Callback Name
                            </th>
                            <th style={columnStyles} scope="col">
                                count state value
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <th style={columnStyles} scope="row">
                                createOrder
                            </th>
                            <td style={columnStyles}>
                                <span>{providerTableCounts[0]}</span>
                            </td>
                        </tr>
                        <tr>
                            <th style={columnStyles} scope="row">
                                onApprove
                            </th>
                            <td style={columnStyles}>
                                <span>{providerTableCounts[1]}</span>
                            </td>
                        </tr>
                        <tr>
                            <th style={columnStyles} scope="row">
                                onChange
                            </th>
                            <td style={columnStyles}>
                                <span>{providerTableCounts[2]}</span>
                            </td>
                        </tr>
                        <tr>
                            <th style={columnStyles} scope="row">
                                onFocus
                            </th>
                            <td style={columnStyles}>
                                <span>{providerTableCounts[3]}</span>
                            </td>
                        </tr>
                        <tr>
                            <th style={columnStyles} scope="row">
                                onBlur
                            </th>
                            <td style={columnStyles}>
                                <span>{providerTableCounts[4]}</span>
                            </td>
                        </tr>
                        <tr>
                            <th style={columnStyles} scope="row">
                                onInputSubmitRequest
                            </th>
                            <td style={columnStyles}>
                                <span>{providerTableCounts[5]}</span>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </section>
        </>
    );
};
