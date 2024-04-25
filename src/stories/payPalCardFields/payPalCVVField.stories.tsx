import React, { useState, useEffect } from "react";
import { action } from "@storybook/addon-actions";

import {
    PayPalScriptProvider,
    usePayPalCardFields,
    PayPalCardFieldsProvider,
    PayPalCVVField,
} from "../../index";
import {
    getOptionsFromQueryString,
    generateRandomString,
    getClientToken,
    FLY_SERVER,
    CREATE_ORDER_URL,
    CAPTURE_ORDER_URL,
} from "../utils";
import {
    COMPONENT_PROPS_CATEGORY,
    COMPONENT_TYPES,
    ORDER_ID,
    ERROR,
} from "../constants";

import type { FC, ReactElement } from "react";
import type {
    CardFieldsOnApproveData,
    PayPalScriptOptions,
} from "@paypal/paypal-js";
import { StoryFn } from "@storybook/react";
import { DocsContextProps } from "@storybook/addon-docs";
import DocPageStructure from "../components/DocPageStructure";
import { getFormCode } from "./code";

const uid = generateRandomString();
const TOKEN_URL = `${FLY_SERVER}/api/paypal/generate-client-token`;
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
    title: "PayPal/PayPalCardFields/Individual",
    component: PayPalCVVField,
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
        style: {
            description:
                "Custom CSS properties to customize each individual card field",
            control: { type: "object" },
            ...{
                ...COMPONENT_PROPS_CATEGORY,
                type: { summary: "CSSProperties" },
            },
        },
        inputEvents: {
            control: false,
            table: { category: "Props", type: { summary: "InputEvents?" } },
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
            const [clientToken, setClientToken] = useState<string | null>(null);

            useEffect(() => {
                (async () => {
                    setClientToken(await getClientToken(TOKEN_URL));
                })();
            }, []);

            return (
                <div style={{ minHeight: "200px" }}>
                    {clientToken && (
                        <>
                            <PayPalScriptProvider
                                options={{
                                    ...scriptProviderOptions,
                                    dataClientToken: clientToken,
                                    dataNamespace: uid,
                                    dataUid: uid,
                                }}
                            >
                                <Story />
                            </PayPalScriptProvider>
                        </>
                    )}
                </div>
            );
        },
    ],
};

export const CVVField: FC = () => {
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
            <PayPalCVVField />
            {/* Custom client component to handle card fields submit */}
            <SubmitPayment isPaying={isPaying} setIsPaying={setIsPaying} />
        </PayPalCardFieldsProvider>
    );
};

/********************
 * OVERRIDE STORIES *
 *******************/
(CVVField as StoryFn).parameters = {
    docs: {
        container: ({ context }: { context: DocsContextProps }) => (
            <DocPageStructure
                context={context}
                code={getFormCode(
                    context.getStoryContext(context.storyById(context.id)).args
                )}
            />
        ),
    },
};
