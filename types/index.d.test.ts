import { loadScript } from "../src/index";
import type { PayPalNamespace } from ".";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const loadScriptBasicPromise: Promise<PayPalNamespace | null> = loadScript({
    "client-id": "test",
});

loadScript({
    "client-id": "test",
    currency: "USD",
    "data-order-id": "12345",
    "disable-funding": "card",
});

loadScript({ "client-id": "test" })
    .then((paypal) => {
        if (!(paypal && paypal.Buttons)) return;

        paypal.Buttons().render("#container");
        paypal.Buttons().render(document.createElement("div"));

        // window.paypal also works
        window.paypal.Buttons().render("#container");

        // minimal createOrder and onApprove payload
        paypal.Buttons({
            createOrder: (data, actions) => {
                return actions.order.create({
                    purchase_units: [
                        {
                            amount: {
                                value: "88.44",
                            },
                        },
                    ],
                });
            },
            onApprove: function (data, actions) {
                return actions.order.capture().then((details) => {
                    console.log(details.payer.name.given_name);
                });
            },
        });

        // authorize a payment
        // https://developer.paypal.com/docs/business/checkout/add-capabilities/authorization/
        paypal.Buttons({
            createOrder: (data, actions) => {
                return actions.order.create({
                    intent: "AUTHORIZE",
                    purchase_units: [
                        {
                            amount: {
                                currency_code: "USD",
                                value: "100.00",
                            },
                        },
                    ],
                });
            },

            onApprove: (data, actions) => {
                return actions.order.authorize().then((authorization) => {
                    const authorizationID =
                        authorization.purchase_units[0].payments
                            .authorizations[0].id;

                    // call your server to validate and capture the transaction
                    // eslint-disable-next-line compat/compat
                    return fetch("/paypal-transaction-complete", {
                        method: "post",

                        headers: {
                            "content-type": "application/json",
                        },

                        body: JSON.stringify({
                            orderID: data.orderID,
                            authorizationID: authorizationID,
                        }),
                    }).then((response) => response.json());
                });
            },
        });

        // server-side integration
        // https://developer.paypal.com/demo/checkout/#/pattern/server
        paypal
            .Buttons({
                createOrder: (data, actions) => {
                    // eslint-disable-next-line compat/compat
                    return fetch("/demo/checkout/api/paypal/order/create/", {
                        method: "post",
                    })
                        .then((res) => res.json())
                        .then((orderData) => orderData.id);
                },

                onApprove: (data, actions) => {
                    // eslint-disable-next-line compat/compat
                    return fetch(
                        `/demo/checkout/api/paypal/order/${data.orderID}/capture/`,
                        {
                            method: "post",
                        }
                    )
                        .then((res) => res.json())
                        .then((orderData) => {
                            const errorDetail =
                                Array.isArray(orderData.details) &&
                                orderData.details[0];

                            if (
                                errorDetail &&
                                errorDetail.issue === "INSTRUMENT_DECLINED"
                            ) {
                                return actions.restart();
                            }

                            if (errorDetail) {
                                const msg =
                                    "Sorry, your transaction could not be processed.";
                                return alert(msg);
                            }

                            const transaction =
                                orderData.purchase_units[0].payments
                                    .captures[0];
                            alert(
                                `Transaction ${transaction.status}: ${transaction.id} \n\nSee console for all available details`
                            );
                        });
                },
            })
            .render("#paypal-button-container");

        // createOrder for partners
        // https://developer.paypal.com/docs/platforms/checkout/set-up-payments#create-order
        paypal.Buttons({
            fundingSource: "paypal",
            createOrder: (data, actions) => {
                return actions.order.create({
                    intent: "CAPTURE",
                    purchase_units: [
                        {
                            amount: {
                                currency_code: "USD",
                                value: "100.00",
                            },
                            payee: {
                                email_address: "seller@example.com",
                            },
                            payment_instruction: {
                                disbursement_mode: "INSTANT",
                                platform_fees: [
                                    {
                                        amount: {
                                            currency_code: "USD",
                                            value: "25.00",
                                        },
                                    },
                                ],
                            },
                        },
                    ],
                });
            },
        });

        // donations
        paypal.Buttons({
            fundingSource: "paypal",
            style: { label: "donate" },
            createOrder: (data, actions) => {
                return actions.order.create({
                    purchase_units: [
                        {
                            amount: {
                                value: "2.00",
                                breakdown: {
                                    item_total: {
                                        currency_code: "USD",
                                        value: "2.00",
                                    },
                                },
                            },
                            items: [
                                {
                                    name: "donation-example",
                                    quantity: "1",
                                    unit_amount: {
                                        currency_code: "USD",
                                        value: "2.00",
                                    },
                                    category: "DONATION",
                                },
                            ],
                        },
                    ],
                });
            },
        });

        // createSubscription
        paypal.Buttons({
            style: { label: "subscribe" },
            createSubscription: (data, actions) => {
                return actions.subscription.create({
                    plan_id: "P-3RX123456M3469222L5IFM4I",
                });
            },
        });

        // validation with onInit and onClick
        // https://developer.paypal.com/docs/checkout/integration-features/validation/
        paypal.Buttons({
            onInit: (data, actions) => {
                actions.disable();

                interface HandleChangeInterface extends Event {
                    target: HTMLInputElement;
                }

                document
                    .querySelector("#check")
                    .addEventListener(
                        "change",
                        (event: HandleChangeInterface) => {
                            if (event.target.checked) {
                                actions.enable();
                            } else {
                                actions.disable();
                            }
                        }
                    );
            },
            onClick: () => {
                if (
                    !document.querySelector<HTMLInputElement>("#check").checked
                ) {
                    document.querySelector("#error").classList.remove("hidden");
                }
            },
        });

        paypal
            .Buttons({
                onClick: (data, actions) => {
                    // eslint-disable-next-line compat/compat
                    return fetch("/my-api/validate", {
                        method: "post",
                        headers: {
                            "content-type": "application/json",
                        },
                    })
                        .then((res) => res.json())
                        .then((data) => {
                            if (data.validationError) {
                                document
                                    .querySelector("#error")
                                    .classList.remove("hidden");
                                return actions.reject();
                            } else {
                                return actions.resolve();
                            }
                        });
                },
            })
            .render("#paypal-button-container");

        // standalone button integration
        // https://developer.paypal.com/docs/business/checkout/configure-payments/standalone-buttons/#2-render-all-eligible-buttons
        paypal.getFundingSources().forEach((fundingSource) => {
            const button = paypal.Buttons({
                fundingSource: fundingSource,
            });

            if (button.isEligible()) {
                button.render("#paypal-button-container");
            }
        });

        // funding eligibility
        // https://developer.paypal.com/docs/business/javascript-sdk/javascript-sdk-reference/#funding-eligibility
        paypal.rememberFunding([paypal.FUNDING.VENMO]);
        paypal.isFundingEligible(paypal.FUNDING.VENMO);
    })
    .catch((err) => {
        console.error(err);
    });

loadScript({ "client-id": "test", "data-namespace": "customName" }).then(
    (customObject) => {
        customObject.Buttons();

        // example showing how to use the types with a custom namespace off window
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const customObjectFromWindow = (window as any)
            .customName as PayPalNamespace;
        customObjectFromWindow.Buttons();
    }
);

// hosted-fields
// https://developer.paypal.com/docs/business/checkout/advanced-card-payments/
loadScript({
    "client-id": "test",
    components: "buttons,hosted-fields",
    "data-client-token": "123456789",
}).then((paypal) => {
    if (paypal.HostedFields.isEligible() === false) return;

    paypal.HostedFields.render({
        createOrder: (data, actions) => {
            return actions.order.create({
                purchase_units: [
                    {
                        amount: {
                            value: "1.00",
                        },
                    },
                ],
            });
        },
        styles: {
            ".valid": {
                color: "green",
            },
            ".invalid": {
                color: "red",
            },
        },
        fields: {
            number: {
                selector: "#card-number",
                placeholder: "4111 1111 1111 1111",
            },
            cvv: {
                selector: "#cvv",
                placeholder: "123",
            },
            expirationDate: {
                selector: "#expiration-date",
                placeholder: "MM/YY",
            },
        },
    }).then((cardFields) => {
        document
            .querySelector("#card-form")
            .addEventListener("submit", (event) => {
                event.preventDefault();
                cardFields.submit({});
            });
    });
});
