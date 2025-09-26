import React, { useState } from "react";
import { action } from "@storybook/addon-actions";

import {
    PayPalScriptProvider,
    usePayPalCardFields,
    PayPalCardFieldsProvider,
    PayPalCVVField,
    PayPalExpiryField,
    PayPalNameField,
    PayPalNumberField,
} from "../../index";
import {
    getOptionsFromQueryString,
    generateRandomString,
    CREATE_ORDER_URL,
    CAPTURE_ORDER_URL,
} from "../utils";
import {
    COMPONENT_PROPS_CATEGORY,
    COMPONENT_TYPES,
    ORDER_ID,
    ERROR,
} from "../constants";
import { getIndividualFieldCode } from "./code";
import DocPageStructure from "../components/DocPageStructure";

import type { DocsContextProps } from "@storybook/addon-docs";
import type { FC } from "react";
import type {
    CardFieldsOnApproveData,
    PayPalScriptOptions,
} from "@paypal/paypal-js";
import type { StoryFn } from "@storybook/react";

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

const description = `Rendering individual fields allows for more granular control over each component as well as flexibility in the layout of all [Card Fields](https://developer.paypal.com/docs/business/checkout/advanced-card-payments/integrate#3-add-javascript-sdk-and-card-form).

This setup relies on the \`<PayPalCardFieldsProvider />\` parent component, which manages the state related to loading the JS SDK script and performs certain validations before rendering the fields.

The individual fields include following components: 

- \`<PaypalNameField />\` _optional_
- \`<PaypalNumberField />\` _required_
- \`<PaypalExpiryField />\` _required_
- \`<PaypalCVVField />\` _required_

Each field accepts it's own independent props, such as \`className\`, \`placeholder\`, \`inputEvents\`, \`style\`. `;

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
    title: "PayPal/PayPalCardFields/Individual Fields",
    parameters: {
        controls: { expanded: true, sort: "requiredFirst" },
        docs: {
            source: { language: "tsx" },
            description: {
                component: description,
            },
        },
    },
    argTypes: {
        className: {
            control: false,
            table: { category: "Props", type: { summary: "string?" } },
            description: "Classes applied to individual field container.",
            defaultValue: {
                summary: "undefined",
            },
        },
        style: {
            description:
                "Custom CSS properties to customize each individual card field. [Supported CSS properties](https://developer.paypal.com/docs/checkout/advanced/customize/card-field-style/#link-supportedcssproperties).",
            control: { type: "object" },
            ...{
                ...COMPONENT_PROPS_CATEGORY,
                type: { summary: "CSSProperties" },
            },
        },
        inputEvents: {
            control: false,
            table: { category: "Props", type: { summary: "InputEvents?" } },
            description:
                "An object containing callbacks for when a specified input event occurs for a field.",
        },
        placeholder: {
            control: false,
            table: { category: "Props", type: { summary: "string?" } },
            description:
                "Each card field has a default placeholder text. Pass a placeholder object to customize this text.",
            defaultValue: {
                summary: "undefined",
            },
        },
        InputEvents: {
            control: false,
            type: { required: false },
            description: `<code>{<br>
                <b class="code-json">onChange</b>: (data: <b>PayPalCardFieldsStateObject</b>) => <b>void</b> <br>
                <b class="code-json">onBlur</b>: (data: <b>PayPalCardFieldsStateObject</b>) => <b>void</b> <br>
                <b class="code-json">onFocus</b>: (data: <b>PayPalCardFieldsStateObject</b>) => <b>void</b> <br>
                <b class="code-json">onInputSubmitRequest</b>: (data: <b>PayPalCardFieldsStateObject</b>) => <b>void</b> <br>
            }</code>
            `,
            table: { category: COMPONENT_TYPES },
        },
        PayPalCardFieldsStateObjectFields: {
            control: false,
            type: { required: false },
            description: `<code>{<br>
                    <b class="code-json">cardCvvField</b>: <b>PayPalCardFieldCardFieldData</b> <br>
                    <b class="code-json">cardNumberField</b>: <b>PayPalCardFieldCardFieldData</b> <br>
                    <b class="code-json">cardNameField</b>: <b>PayPalCardFieldCardFieldData</b> <br>
                    <b class="code-json">cardExpiryField</b>: <b>PayPalCardFieldCardFieldData</b> <br>
                }</code>
            `,
            table: { category: COMPONENT_TYPES },
        },
        PayPalCardFieldsStateObject: {
            control: false,
            type: { required: false },
            description: `<code>{<br>
                <b class="code-json">cards</b>: <b>PayPalCardFieldsCardObject</b>[] <br>
                <b class="code-json">emittedBy</b>?: "name" | "number" | "cvv" | "expiry" <br>
                <b class="code-json">isFormValid</b>: boolean <br>
                <b class="code-json">errors</b>: <b>PayPalCardFieldError</b>[] <br>
                <b class="code-json">fields</b>: <b>PayPalCardFieldsStateObjectFields</b><br>
            }</code>
            `,
            table: { category: COMPONENT_TYPES },
        },
        PayPalCardFieldsCardObject: {
            control: false,
            type: { required: false },
            description: `<code>{<br>
                <b class="code-json">code</b>: <b>PayPalCardFieldSecurityCode</b> <br>
                <b class="code-json">niceType</b>: string  <br>
                <b class="code-json">type</b>: "american-express" | "diners-club" | "discover" | "jcb" | "maestro" | "mastercard" | "unionpay" | "visa" | "elo" | "hiper" | "hipercard" <br>
            }</code>
            `,
            table: { category: COMPONENT_TYPES },
        },
        PayPalCardFieldError: {
            control: false,
            type: { required: false },
            description: `<code>"INELIGIBLE_CARD_VENDOR" | "INVALID_NAME" | "INVALID_NUMBER" | "INVALID_EXPIRY" | "INVALID_CVV" </code>
            `,
            table: { category: COMPONENT_TYPES },
        },
        PayPalCardFieldSecurityCode: {
            control: false,
            type: { required: false },
            description: `<code>{<br>
                <b class="code-json">code</b>: string <br>
                <b class="code-json">size</b>: number  <br>
            }</code>
            `,
            table: { category: COMPONENT_TYPES },
        },
        PayPalCardFieldCardFieldData: {
            control: false,
            type: { required: false },
            description: `<code>{<br>
                <b class="code-json">isFocused</b>: boolean <br>
                <b class="code-json">isEmpty</b>: boolean  <br>
                <b class="code-json">isValid</b>: boolean  <br>
                <b class="code-json">isPotentiallyValid</b>: boolean  <br>
            }</code>
            `,
            table: { category: COMPONENT_TYPES },
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
                <PayPalNameField />
                <PayPalNumberField />
                <PayPalExpiryField />
                <PayPalCVVField />
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
            <DocPageStructure
                context={context}
                code={getIndividualFieldCode()}
            />
        ),
    },
};

export const WithDynamicOrderState: FC = () => {
    const [count, setCount] = useState(0);
    const [fieldsTableCounts, setFieldsTableCounts] = useState(
        new Array(16).fill(count),
    );
    const [providerTableCounts, setProviderTableCounts] = useState([
        count,
        count,
    ]);
    const [isPaying, setIsPaying] = useState(false);

    const updateFieldsTableCount = (
        row: number,
        column: number,
        count: number,
    ) => {
        const index = row * 4 + column;
        const newFieldsTableCounts = [...fieldsTableCounts];
        newFieldsTableCounts[index] = count;
        setFieldsTableCounts(newFieldsTableCounts);
    };

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
        maxWidth: "1400px",
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
                        console.log("onError count: ", count);
                        console.log(err);
                    }}
                >
                    <PayPalNameField
                        inputEvents={{
                            onChange: () => updateFieldsTableCount(0, 0, count),
                            onFocus: () => updateFieldsTableCount(1, 0, count),
                            onBlur: () => updateFieldsTableCount(2, 0, count),
                            onInputSubmitRequest: () =>
                                updateFieldsTableCount(3, 0, count),
                        }}
                    />
                    <PayPalNumberField
                        inputEvents={{
                            onChange: () => updateFieldsTableCount(0, 1, count),
                            onFocus: () => updateFieldsTableCount(1, 1, count),
                            onBlur: () => updateFieldsTableCount(2, 1, count),
                            onInputSubmitRequest: () =>
                                updateFieldsTableCount(3, 1, count),
                        }}
                    />
                    <PayPalExpiryField
                        inputEvents={{
                            onChange: () => updateFieldsTableCount(0, 2, count),
                            onFocus: () => updateFieldsTableCount(1, 2, count),
                            onBlur: () => updateFieldsTableCount(2, 2, count),
                            onInputSubmitRequest: () =>
                                updateFieldsTableCount(3, 2, count),
                        }}
                    />
                    <PayPalCVVField
                        inputEvents={{
                            onChange: () => updateFieldsTableCount(0, 3, count),
                            onFocus: () => updateFieldsTableCount(1, 3, count),
                            onBlur: () => updateFieldsTableCount(2, 3, count),
                            onInputSubmitRequest: () =>
                                updateFieldsTableCount(3, 3, count),
                        }}
                    />
                    {/* Custom client component to handle card fields submit */}
                    <SubmitPayment
                        isPaying={isPaying}
                        setIsPaying={setIsPaying}
                    />
                </PayPalCardFieldsProvider>
            </PayPalScriptProvider>
            <section>
                <h2>Count state on Provider Callbacks</h2>
                <p>
                    <b>createOrder:</b> <span>{providerTableCounts[0]}</span>
                </p>
                <p>
                    <b>onApprove:</b> <span>{providerTableCounts[1]}</span>
                </p>
            </section>
            <section>
                <h2>Count state on individual fields callbacks</h2>
                <table style={tableStyles}>
                    <thead>
                        <tr>
                            <th style={columnStyles} scope="col">
                                Event Callback
                            </th>
                            <th style={columnStyles} scope="col">
                                Name Field
                            </th>
                            <th style={columnStyles} scope="col">
                                Number Field
                            </th>
                            <th style={columnStyles} scope="col">
                                Expiry Field
                            </th>
                            <th style={columnStyles} scope="col">
                                CVV Field
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <th style={columnStyles} scope="row">
                                onChange
                            </th>
                            <td style={columnStyles}>
                                <span>{fieldsTableCounts[0]}</span>
                            </td>
                            <td style={columnStyles}>
                                <span>{fieldsTableCounts[1]}</span>
                            </td>
                            <td style={columnStyles}>
                                <span>{fieldsTableCounts[2]}</span>
                            </td>
                            <td style={columnStyles}>
                                <span>{fieldsTableCounts[3]}</span>
                            </td>
                        </tr>
                        <tr>
                            <th style={columnStyles} scope="row">
                                onFocus
                            </th>
                            <td style={columnStyles}>
                                <span>{fieldsTableCounts[4]}</span>
                            </td>
                            <td style={columnStyles}>
                                <span>{fieldsTableCounts[5]}</span>
                            </td>
                            <td style={columnStyles}>
                                <span>{fieldsTableCounts[6]}</span>
                            </td>
                            <td style={columnStyles}>
                                <span>{fieldsTableCounts[7]}</span>
                            </td>
                        </tr>
                        <tr>
                            <th style={columnStyles} scope="row">
                                onBlur
                            </th>
                            <td style={columnStyles}>
                                <span>{fieldsTableCounts[8]}</span>
                            </td>
                            <td style={columnStyles}>
                                <span>{fieldsTableCounts[9]}</span>
                            </td>
                            <td style={columnStyles}>
                                <span>{fieldsTableCounts[10]}</span>
                            </td>
                            <td style={columnStyles}>
                                <span>{fieldsTableCounts[11]}</span>
                            </td>
                        </tr>
                        <tr>
                            <th style={columnStyles} scope="row">
                                onInputSubmitRequest
                            </th>
                            <td style={columnStyles}>
                                <span>{fieldsTableCounts[12]}</span>
                            </td>
                            <td style={columnStyles}>
                                <span>{fieldsTableCounts[13]}</span>
                            </td>
                            <td style={columnStyles}>
                                <span>{fieldsTableCounts[14]}</span>
                            </td>
                            <td style={columnStyles}>
                                <span>{fieldsTableCounts[15]}</span>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </section>
        </>
    );
};
