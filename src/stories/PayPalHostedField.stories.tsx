import React, { useState, useEffect, useRef } from "react";
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
const CREATE_ORDER_URL = `${HEROKU_SERVER}/api/paypal/checkout/orders`;
const scriptProviderOptions: PayPalScriptOptions = {
    "client-id":
        "AdOu-W3GPkrfuTbJNuW9dWVijxvhaXHFIRuKrLDwu14UDwTTHWMFkUwuu9D8I1MAQluERl9cFOd7Mfqe",
    components: "buttons,hosted-fields",
    ...getOptionsFromQueryString(),
};

/**
 * Get dynamically the capture order URL to fetch the payment info
 *
 * @param orderId the order identifier
 * @returns an URL string
 */
function captureOrderUrl(orderId: string): string {
    return `${HEROKU_SERVER}/api/paypal/checkout/orders/${orderId}/capture`;
}

/**
 * Functional component to render a custom ineligible error UI
 */
const NotEligibleError = () => (
    <h3>Your client is not able to use hosted fields</h3>
);

/**
 * Functional component to submit the hosted fields form
 */
const SubmitPayment = () => {
    const [paying, setPaying] = useState(false);
    const cardHolderName = useRef<HTMLInputElement>(null);
    const hostedField = usePayPalHostedFields();

    const handleClick = () => {
        if (
            hostedField &&
            cardHolderName.current &&
            cardHolderName.current.value
        ) {
            setPaying(true);
            hostedField
                .submit({
                    cardholderName: cardHolderName.current.value,
                })
                .then((data) => {
                    console.log("orderId: ", data.orderId);
                    fetch(captureOrderUrl(data.orderId), {
                        method: "post",
                    })
                        .then((response) => response.json())
                        .then((data) => {
                            alert(JSON.stringify(data));
                        })
                        .catch((err) => {
                            alert(JSON.stringify(err));
                        })
                        .finally(() => {
                            setPaying(false);
                        });
                })
                .catch((err) => {
                    alert(JSON.stringify(err));
                });
        }
    };

    return (
        <>
            <input
                ref={cardHolderName}
                className="card-field"
                type="text"
                placeholder="Card holder name "
            />
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
    title: "Example/PayPalHostedFields",
    component: PayPalHostedField,
    argTypes: {
        PayPalHostedFieldOptions: {
            control: { type: "null" },
            type: { required: true },
            description: `<code>{<br>
                <b class="code-json">selector</b>: The string element selector (#id, .class). Represent the field identifier.<br>
                <b class="code-json">placeholder</b>: The placeholder of the field cvv->(300), expirationDate->(MM/YY).<br>
                <b class="code-json">type</b>: The type attribute of the input. To mask cvv input, for instance, type: "password" can be used.<br>
                <b class="code-json">formatInput</b>: Enable or disable automatic formatting on this field.<br>
                <b class="code-json">maskInput</b>: Enable or disable input masking when input is not focused.<br><span class="code-json">If set to true instead of an object, the defaults for the maskInput parameters will be used.</span><br>
                <b class="code-json">select</b>: If truthy, this field becomes a select dropdown list.<br><span class="code-json">This can only be used for expirationMonth and expirationYear fields.</span><br><span class="code-json">If you do not use a placeholder property for the field,</span><br><span class="code-json">the current month/year will be the default selected value.</span><br>
                <b class="code-json">maxlength</b>: This option applies only to the CVV and postal code fields.<br><span class="code-json">Will be used as the maxlength attribute of the input if it is less than the default.</span><br>
                <b class="code-json">minlength</b>: This option applies only to the cvv and postal code fields.<br><span class="code-json">Will be used as the minlength attribute of the input.</span><br>
                <b class="code-json">prefill</b>: A value to prefill the field with. For example, when creating an update card form,<br><span class="code-json">you can prefill the expiration date fields with the old expiration date data.<span><br>
                <b class="code-json">rejectUnsupportedCards</b>: Only allow card types that your merchant account is able to process.<br><span class="code-json">Unsupported card types will invalidate the card form.</span><br>
            }</code>
            `,
            table: {
                category: "Types",
            },
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
            createOrder={() =>
                fetch(CREATE_ORDER_URL, {
                    method: "post",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        purchase_units: [
                            {
                                amount: {
                                    value: 50,
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
                        alert(err);
                    })
            }
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
                    maskInput: true,
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
            {/* Custom client component to handle hosted fields submit */}
            <SubmitPayment />
        </PayPalHostedFieldsProvider>
    );
};

export const ExpirationDate: FC = () => {
    return (
        <PayPalHostedFieldsProvider
            createOrder={() =>
                fetch(CREATE_ORDER_URL, {
                    method: "post",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        purchase_units: [
                            {
                                amount: {
                                    value: 50,
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
                        alert(err);
                    })
            }
            notEligibleError={<NotEligibleError />}
            styles={{
                ".valid": { color: "#28a745" },
                ".invalid": { color: "#dc3545" },
            }}
        >
            <PayPalHostedField
                id="card-number-1"
                className="card-field"
                hostedFieldType={PAYPAL_HOSTED_FIELDS_TYPES.NUMBER}
                options={{
                    selector: "#card-number-1",
                    placeholder: "4111 1111 1111 1111",
                }}
            />
            <PayPalHostedField
                id="cvv-1"
                className="card-field"
                hostedFieldType={PAYPAL_HOSTED_FIELDS_TYPES.CVV}
                options={{
                    selector: "#cvv-1",
                    placeholder: "123",
                    maskInput: true,
                }}
            />
            <PayPalHostedField
                id="expiration-month-1"
                className="card-field"
                hostedFieldType={PAYPAL_HOSTED_FIELDS_TYPES.EXPIRATION_MONTH}
                options={{ selector: "#expiration-month-1", placeholder: "MM" }}
            />
            <PayPalHostedField
                id="expiration-year-1"
                className="card-field"
                hostedFieldType={PAYPAL_HOSTED_FIELDS_TYPES.EXPIRATION_YEAR}
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
