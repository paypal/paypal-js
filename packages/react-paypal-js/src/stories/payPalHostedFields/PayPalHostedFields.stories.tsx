import React, { useState, useEffect, useRef } from "react";
import { action } from "@storybook/addon-actions";

import {
    PayPalScriptProvider,
    PayPalHostedFieldsProvider,
    PayPalHostedField,
    usePayPalHostedFields,
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
    ARG_TYPE_AMOUNT,
    ORDER_ID,
    ERROR,
} from "../constants";
import DocPageStructure from "../components/DocPageStructure";
import { InEligibleError } from "../commons";
import { getDefaultCode, getExpirationDateCode } from "./codeHostedFields";

import type { CSSProperties, FC, ReactElement } from "react";
import type { StoryFn } from "@storybook/react";
import type { DocsContextProps } from "@storybook/addon-docs";
import type { PayPalScriptOptions } from "@paypal/paypal-js";

type StoryProps = {
    amount: string;
    styles: Record<string, unknown>;
    style: CSSProperties;
};

const uid = generateRandomString();
const TOKEN_URL = `${FLY_SERVER}/api/paypal/generate-client-token`;
const RED_COLOR = "#dc3545";
const GREEN_COLOR = "#28a745";
const scriptProviderOptions: PayPalScriptOptions = {
    clientId:
        "AduyjUJ0A7urUcWtGCTjanhRBSzOSn9_GKUzxWDnf51YaV1eZNA0ZAFhebIV_Eq-daemeI7dH05KjLWm",
    components: "buttons,hosted-fields",
    ...getOptionsFromQueryString(),
};
const CREATE_ORDER = "createOrder";
const SUBMIT_FORM = "submitForm";
const CAPTURE_ORDER = "captureOrder";

/**
 * Functional component to submit the hosted fields form
 */
const SubmitPayment = ({ customStyle }: { customStyle?: CSSProperties }) => {
    const [paying, setPaying] = useState(false);
    const cardHolderName = useRef<HTMLInputElement>(null);
    const hostedField = usePayPalHostedFields();

    const handleClick = () => {
        if (!hostedField?.cardFields) {
            const childErrorMessage =
                "Unable to find any child components in the <PayPalHostedFieldsProvider />";

            action(ERROR)(childErrorMessage);
            throw new Error(childErrorMessage);
        }
        const isFormInvalid =
            Object.values(hostedField.cardFields.getState().fields).some(
                (field) => !field.isValid,
            ) || !cardHolderName?.current?.value;

        if (isFormInvalid) {
            return alert("The payment form is invalid");
        }
        action(SUBMIT_FORM)("Form is valid and submitted");
        setPaying(true);
        hostedField.cardFields
            .submit({
                cardholderName: cardHolderName?.current?.value,
            })
            .then((data) => {
                action(`Received ${ORDER_ID}`)(data.orderId);
                action(CAPTURE_ORDER)(
                    `Sending ${ORDER_ID} to custom endpoint to capture the payment information`,
                );
                fetch(CAPTURE_ORDER_URL, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ orderID: data.orderId }),
                })
                    .then((response) => response.json())
                    .then((data) => {
                        action(CAPTURE_ORDER)(data);
                    })
                    .catch((err) => {
                        action(ERROR)(err.message);
                        console.error(err);
                    })
                    .finally(() => {
                        setPaying(false);
                    });
            })
            .catch((err) => {
                action(ERROR)(err.message);
                setPaying(false);
            });
    };

    return (
        <>
            <label title="This represents the full name as shown in the card">
                Card Holder Name
                <input
                    id="card-holder"
                    ref={cardHolderName}
                    className="card-field"
                    style={{ ...customStyle, outline: "none" }}
                    type="text"
                    placeholder="Full name"
                />
            </label>
            <button
                className={`btn${paying ? "" : " btn-primary"}`}
                style={{ float: "right" }}
                onClick={handleClick}
            >
                {paying ? <div className="spinner tiny" /> : "Pay"}
            </button>
        </>
    );
};

export default {
    title: "PayPal/PayPalHostedFields",
    component: PayPalHostedField,
    parameters: {
        controls: { expanded: true, sort: "requiredFirst" },
    },
    argTypes: {
        hostedFieldType: {
            control: false,
            ...COMPONENT_PROPS_CATEGORY,
        },
        options: { control: false, ...COMPONENT_PROPS_CATEGORY },
        align: { control: false, ...COMPONENT_PROPS_CATEGORY },
        className: { control: false, ...COMPONENT_PROPS_CATEGORY },
        id: { control: false, ...COMPONENT_PROPS_CATEGORY },
        lang: { control: false, ...COMPONENT_PROPS_CATEGORY },
        styles: {
            description:
                "Custom CSS properties to customize the <code>PayPalHostedFieldsProvider</code> component",
            control: { type: "object" },
            ...{
                ...COMPONENT_PROPS_CATEGORY,
                type: { summary: "CSSProperties" },
            },
        },
        title: { control: false, ...COMPONENT_PROPS_CATEGORY },
        amount: ARG_TYPE_AMOUNT,
        style: {
            description:
                "Custom CSS properties to customize the <code>PayPalHostedField</code> component",
            control: { type: "object" },
            ...{
                ...COMPONENT_PROPS_CATEGORY,
                type: { summary: "CSSProperties" },
            },
        },
        PAYPAL_HOSTED_FIELDS_TYPES: {
            control: false,
            type: { required: true },
            description: `<code>NUMBER | CVV | EXPIRATION_DATE |<br>EXPIRATION_MONTH | EXPIRATION_YEAR | POSTAL_CODE</code>
            `,
            table: { category: COMPONENT_TYPES },
        },
        PayPalHostedFieldOptions: {
            control: false,
            type: { required: true },
            description: `<code>{<br>
                <b class="code-json">selector</b>: The string element selector<br><span class="code-json">(#id, .class).Represent the field identifier.</span><br>
                <b class="code-json">placeholder</b>: The placeholder of the field<br><span class="code-json">cvv->(300), expirationDate->(MM/YY).</span><br>
                <b class="code-json">type</b>: The type attribute of the input.<br><span class="code-json">To mask cvv input, for instance,</span><br><span class="code-json">type: "password" can be used.</span><br>
                <b class="code-json">formatInput</b>: Enable or disable automatic<br><span class="code-json">formatting on this field.</span><br>
                <b class="code-json">maskInput</b>: Enable or disable input masking<br><span class="code-json">when input is not focused.</span><br><span class="code-json">If set to true instead of an object,</span><br><span class="code-json">the defaults for the maskInput</span><br><span class="code-json">parameters will be used.</span><br>
                <b class="code-json">select</b>: If truthy, this field becomes<br><span class="code-json">a select dropdown list.This can only</span><br><span class="code-json">be used for expirationMonth and</span><br><span class="code-json">expirationYear fields.</span><br><span class="code-json">If you do not use a placeholder property</span><br><span class="code-json">for the field,</span><br><span class="code-json">the current month/year will be the</span><br><span class="code-json">default selected value.</span><br>
                <b class="code-json">maxlength</b>: This option applies only<br><span class="code-json">to the CVV and postal code fields.</span><br><span class="code-json">Will be used as the maxlength attribute</span><br><span class="code-json">of the input if it is less than the default.</span><br>
                <b class="code-json">minlength</b>: This option applies only to<br><span class="code-json">the cvv and postal code fields.</span><br><span class="code-json">Will be used as the minlength attribute</span><br><span class="code-json">of the input.</span><br>
                <b class="code-json">prefill</b>: A value to prefill the field with.<br><span class="code-json">For example, when creating an update card form,</span><br><span class="code-json">you can prefill the expiration date fields</span><br><span class="code-json">with the old expiration date data.<span><br>
                <b class="code-json">rejectUnsupportedCards</b>: Only allow card types<br><span class="code-json">that your merchant account is able to process.</span><br><span class="code-json">Unsupported card types will</span><br><span class="code-json">invalidate the card form.</span><br>
            }</code>
            `,
            table: { category: COMPONENT_TYPES },
        },
    },
    args: {
        amount: "2",
        styles: {
            ".valid": { color: GREEN_COLOR },
            ".invalid": { color: RED_COLOR },
            input: { "font-family": "monospace", "font-size": "16px" },
        },
        style: {
            border: "1px solid #606060",
            boxShadow: "2px 2px 10px 2px rgba(0,0,0,0.1)",
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

export const Default: FC<StoryProps> = ({ styles, style }) => {
    return (
        <PayPalHostedFieldsProvider
            createOrder={() => {
                action(CREATE_ORDER)(
                    "Start creating the order in custom endpoint",
                );
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
            }}
            notEligibleError={<InEligibleError />}
            styles={styles}
        >
            <label htmlFor="card-number">
                Card Number<span style={{ color: RED_COLOR }}>*</span>
            </label>
            <PayPalHostedField
                id="card-number"
                className="card-field"
                style={style}
                hostedFieldType="number"
                options={{
                    selector: "#card-number",
                    placeholder: "4111 1111 1111 1111",
                }}
            />
            <label htmlFor="cvv">
                CVV<span style={{ color: RED_COLOR }}>*</span>
            </label>
            <PayPalHostedField
                id="cvv"
                className="card-field"
                style={style}
                hostedFieldType="cvv"
                options={{
                    selector: "#cvv",
                    placeholder: "123",
                    maskInput: true,
                }}
            />
            <label htmlFor="expiration-date">
                Expiration Date<span style={{ color: RED_COLOR }}>*</span>
            </label>
            <PayPalHostedField
                id="expiration-date"
                className="card-field"
                style={style}
                hostedFieldType="expirationDate"
                options={{
                    selector: "#expiration-date",
                    placeholder: "MM/YYYY",
                }}
            />
            {/* Custom client component to handle hosted fields submit */}
            <SubmitPayment customStyle={style} />
        </PayPalHostedFieldsProvider>
    );
};

export const ExpirationDate: FC<{ amount: string }> = ({ amount }) => {
    return (
        <PayPalHostedFieldsProvider
            createOrder={() =>
                fetch(CREATE_ORDER_URL, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        purchase_units: [
                            {
                                amount: {
                                    value: amount,
                                    currency_code: "USD",
                                },
                            },
                        ],
                        intent: "CAPTURE",
                    }),
                })
                    .then((response) => response.json())
                    .then((order) => order.id)
                    .catch((err) => {
                        action(ERROR)(err.message);
                        console.error(err);
                    })
            }
            notEligibleError={<InEligibleError />}
            styles={{
                ".valid": { color: GREEN_COLOR },
                ".invalid": { color: RED_COLOR },
            }}
        >
            <PayPalHostedField
                id="card-number-1"
                className="card-field"
                hostedFieldType="number"
                options={{
                    selector: "#card-number-1",
                    placeholder: "4111 1111 1111 1111",
                }}
            />
            <PayPalHostedField
                id="cvv-1"
                className="card-field"
                hostedFieldType="cvv"
                options={{
                    selector: "#cvv-1",
                    placeholder: "123",
                    maskInput: true,
                }}
            />
            <PayPalHostedField
                id="expiration-month-1"
                className="card-field"
                hostedFieldType="expirationMonth"
                options={{ selector: "#expiration-month-1", placeholder: "MM" }}
            />
            <PayPalHostedField
                id="expiration-year-1"
                className="card-field"
                hostedFieldType="expirationYear"
                options={{
                    selector: "#expiration-year-1",
                    placeholder: "YYYY",
                }}
            />
            {/* Custom client component to handle hosted fields submit */}
            <SubmitPayment />
        </PayPalHostedFieldsProvider>
    );
};

/********************
 * OVERRIDE STORIES *
 *******************/
(Default as StoryFn).parameters = {
    docs: {
        container: ({
            context,
        }: {
            context: DocsContextProps;
        }): ReactElement => (
            <DocPageStructure
                context={context}
                code={getDefaultCode(
                    context.getStoryContext(context.storyById(context.id)).args,
                )}
            />
        ),
    },
};

(ExpirationDate as StoryFn).parameters = {
    docs: {
        container: ({
            context,
        }: {
            context: DocsContextProps;
        }): ReactElement => (
            <DocPageStructure
                context={context}
                code={getExpirationDateCode(
                    context.getStoryContext(context.storyById(context.id)).args,
                )}
            />
        ),
    },
};

(ExpirationDate as StoryFn).args = {
    style: {},
};
