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

        // createSubscription
        paypal.Buttons({
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

        // standalone buton integration
        // https://developer.paypal.com/docs/business/checkout/configure-payments/standalone-buttons/#2-render-all-eligible-buttons
        paypal.getFundingSources().forEach((fundingSource) => {
            const button = paypal.Buttons({
                fundingSource: fundingSource,
            });

            if (button.isEligible()) {
                button.render("#paypal-button-container");
            }
        });
    })
    .catch((err) => {
        console.error(err);
    });
