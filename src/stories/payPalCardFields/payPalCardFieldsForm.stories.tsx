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
import type { FC, ReactElement } from "react";
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
