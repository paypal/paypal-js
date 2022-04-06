import { loadScript } from "../../src/index";
import type { PayPalNamespace } from "../index";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function main() {
    let paypal: PayPalNamespace | null;

    try {
        paypal = await loadScript({
            "client-id": "test",
            components: "buttons",
        });
    } catch (err) {
        throw new Error(`Failed to load the paypal sdk script: ${err}`);
    }

    if (!paypal?.Buttons) {
        throw new Error("Invalid paypal object for buttons component");
    }

    paypal.Buttons().render("#container");
    paypal.Buttons().render(document.createElement("div"));

    // client-side integration
    // https://developer.paypal.com/demo/checkout/#/pattern/client
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
            if (!actions.order) return Promise.reject("Invalid actions object");
            return actions.order.capture().then((orderData) => {
                const buyerGivenName = orderData.payer.name?.given_name;

                console.log(buyerGivenName);
            });
        },
    });

    // server-side integration
    // https://developer.paypal.com/demo/checkout/#/pattern/server
    paypal
        .Buttons({
            createOrder: () => {
                return fetch("/your/api/order/create/", {
                    method: "post",
                })
                    .then((res) => res.json())
                    .then((orderData) => orderData.id);
            },

            onApprove: (data, actions) => {
                return fetch(`/your/api/order/${data.orderID}/capture/`, {
                    method: "post",
                })
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
                            orderData.purchase_units[0].payments.captures[0];
                        alert(
                            `Transaction ${transaction.status}: ${transaction.id} \n\nSee console for all available details`
                        );
                    });
            },
        })
        .render("#paypal-button-container");

    // authorize a payment
    // https://developer.paypal.com/docs/checkout/standard/customize/authorization/
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
            if (!actions.order) return Promise.reject("Invalid actions object");
            return actions.order.authorize().then((authorization) => {
                if (!authorization.purchase_units[0].payments?.authorizations) {
                    return Promise.reject();
                }

                const authorizationID =
                    authorization.purchase_units[0].payments.authorizations[0]
                        .id;

                // call your server to validate and capture the transaction
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

    // createOrder for partners
    // https://developer.paypal.com/docs/multiparty/checkout/standard/integrate/
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
    // https://developer.paypal.com/docs/checkout/standard/customize/validate-user-input/
    paypal.Buttons({
        onInit: (data, actions) => {
            actions.disable();
            document
                .querySelector("#check")
                ?.addEventListener("change", (event) => {
                    if ((event.target as HTMLInputElement).checked) {
                        actions.enable();
                    } else {
                        actions.disable();
                    }
                });
        },
        onClick: () => {
            if (!document.querySelector<HTMLInputElement>("#check")?.checked) {
                document.querySelector("#error")?.classList.remove("hidden");
            }
        },
    });

    paypal
        .Buttons({
            onClick: (data, actions) => {
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
                                ?.classList.remove("hidden");
                            return actions.reject();
                        } else {
                            return actions.resolve();
                        }
                    });
            },
        })
        .render("#paypal-button-container");

    // standalone button integration
    // https://developer.paypal.com/docs/checkout/standard/customize/standalone-buttons/#link-renderastandalonebutton
    paypal.getFundingSources?.().forEach((fundingSource) => {
        if (!paypal?.Buttons) {
            return;
        }
        const button = paypal.Buttons({
            fundingSource: fundingSource,
        });

        if (button.isEligible()) {
            button.render("#paypal-button-container");
        }
    });

    // funding eligibility
    // https://developer.paypal.com/sdk/js/reference/#link-fundingeligibility
    if (paypal.FUNDING) {
        paypal.rememberFunding?.([paypal.FUNDING.VENMO]);
        paypal.isFundingEligible?.(paypal.FUNDING.VENMO);
    }
}
