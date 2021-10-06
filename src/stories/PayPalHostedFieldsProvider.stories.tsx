import React, { useState, useEffect } from "react";
import type { FC, ReactElement } from "react";

import type { PayPalScriptOptions } from "@paypal/paypal-js/types/script-options";

import {
    PayPalScriptProvider,
    PayPalHostedFieldsProvider,
    PayPalHostedField,
    PAYPAL_HOSTED_FIELDS_TYPES,
    usePayPalHostedFields,
} from "../index";
import {
    getOptionsFromQueryString,
    generateRandomString,
    getClientToken,
    HEROKU_SERVER,
} from "./utils";

const uid = generateRandomString();
const TOKEN_URL = `${HEROKU_SERVER}/api/paypal/hosted-fields/auth`;
const scriptProviderOptions: PayPalScriptOptions = {
    "client-id":
        "AdOu-W3GPkrfuTbJNuW9dWVijxvhaXHFIRuKrLDwu14UDwTTHWMFkUwuu9D8I1MAQluERl9cFOd7Mfqe",
    components: "buttons,hosted-fields",
    ...getOptionsFromQueryString(),
};

// Component to show the client isn't eligible to use hosted fields
const NotEligibleError = () => (
    <h3>Your client is not able to use hosted fields</h3>
);

const LoadedCardFields = () => {
    const cardFields = usePayPalHostedFields();

    return (
        <>
            <p>
                <b>Hosted fields loaded: </b>
                {cardFields ? (
                    <span style={{ fontSize: "20px" }}>&#9989;</span>
                ) : (
                    <span style={{ fontSize: "20px" }}>&#10060;</span>
                )}
            </p>
        </>
    );
};

export default {
    title: "Example/PayPalHostedFieldsProvider",
    component: PayPalHostedFieldsProvider,
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
                                    "data-client-token": clientToken,
                                    "data-namespace": uid,
                                    "data-uid": uid,
                                    debug: true,
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

export const Default: FC = () => {
    return (
        <PayPalHostedFieldsProvider
            createOrder={() => {
                // Server call to create the order
                return Promise.resolve("7NE43326GP4951156");
            }}
            notEligibleError={<NotEligibleError />}
            styles={{
                ".valid": { color: "#28a745" },
                ".invalid": { color: "#dc3545" },
            }}
        >
            <PayPalHostedField
                id="card-number"
                className="card-field"
                hostedFieldType={PAYPAL_HOSTED_FIELDS_TYPES.NUMBER}
                options={{
                    selector: "#card-number",
                    placeholder: "4111 1111 1111 1111",
                }}
            />
            <PayPalHostedField
                id="cvv"
                className="card-field"
                hostedFieldType={PAYPAL_HOSTED_FIELDS_TYPES.CVV}
                options={{
                    selector: "#cvv",
                    placeholder: "123",
                    maskInput: {
                        character: "#",
                    },
                }}
            />
            <PayPalHostedField
                id="expiration-date"
                className="card-field"
                hostedFieldType={PAYPAL_HOSTED_FIELDS_TYPES.EXPIRATION_DATE}
                options={{
                    selector: "#expiration-date",
                    placeholder: "MM/YYYY",
                }}
            />
            <LoadedCardFields />
        </PayPalHostedFieldsProvider>
    );
};
