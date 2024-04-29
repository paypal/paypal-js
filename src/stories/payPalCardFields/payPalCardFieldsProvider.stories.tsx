import React, { useState } from "react";
import { action } from "@storybook/addon-actions";

import {
    PayPalScriptProvider,
    PayPalCardFieldsProvider,
    PayPalCardFieldsForm,
    usePayPalCardFields,
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
import { getFormCode } from "./code";
import DocPageStructure from "../components/DocPageStructure";

import type { FC, ReactElement } from "react";
import type {
    CardFieldsOnApproveData,
    PayPalScriptOptions,
} from "@paypal/paypal-js";
import type { StoryFn } from "@storybook/react";
import type { DocsContextProps } from "@storybook/addon-docs";

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
 * Functional component to submit the hosted fields form
 */

const SubmitPayment: React.FC<{
    isPaying: boolean;
    setIsPaying: React.Dispatch<React.SetStateAction<boolean>>;
}> = ({ isPaying, setIsPaying }) => {
    const { cardFieldsForm } = usePayPalCardFields();

    const handleClick = async () => {
        if (!cardFieldsForm) {
            const childErrorMessage =
                "Unable to find any child components in the <PayPalHostedFieldsProvider />";

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
    title: "PayPal/PayPalCardFields/Context Provider",
    component: PayPalCardFieldsProvider,
    parameters: {
        controls: { expanded: true, sort: "requiredFirst" },
        docs: {
            source: { language: "tsx" },
            disabled: true,
        },
    },
    argTypes: {
        createOrder: {
            control: false,
            type: {
                required: true,
            },
            table: {
                category: "Props",
                type: { summary: "() => Promise<string>" },
            },
            description:
                "The callback to create the order on your server. [CardFields options documentation](https://developer.paypal.com/sdk/js/reference/#link-options)",
        },
        onApprove: {
            control: false,
            type: {
                required: true,
            },
            table: {
                category: "Props",
                type: { summary: "(data: CardFieldsOnApproveData) => void" },
            },
            description:
                "The callback to capture the order on your server. [CardFields options documentation](https://developer.paypal.com/sdk/js/reference/#link-options)",
        },
        onError: {
            control: false,
            type: {
                required: true,
            },
            table: {
                category: "Props",
                type: { summary: "(err: Record<string, unknown>) => void" },
            },
            description:
                "The callback to catch errors during checkout. [CardFields options documentation](https://developer.paypal.com/sdk/js/reference/#link-options)",
        },
        createVaultSetupToken: {
            control: false,
            type: {
                required: false,
            },
            table: {
                category: "Props",
                type: { summary: "() => Promise<string>" },
            },
            description:
                "The callback to create the `vaultSetupToken` on your server.",
        },
        style: {
            description:
                "Custom CSS properties to customize each individual card field. [Supported CSS properties](https://developer.paypal.com/docs/checkout/advanced/customize/card-field-style/#link-supportedcssproperties)",
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
                "An object containing callbacks that will be applied to each input field.",
        },
        CardFieldsOnApproveData: {
            control: false,
            type: { required: false },
            description: `<code>{<br>
                <b class="code-json">orderID</b>: string <br> 
            }</code>
            `,
            table: { category: COMPONENT_TYPES },
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
    decorators: [
        (Story: FC): ReactElement => {
            // Workaround to render the story after got the client token,
            // The new experimental loaders doesn't work in Docs views

            return (
                <div style={{ minHeight: "200px" }}>
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
            `Sending ${ORDER_ID} to custom endpoint to capture the payment information`
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
