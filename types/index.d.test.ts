import { loadScript } from '../src/index';
import type { PayPalNamespace } from '.';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const loadScriptBasicPromise: Promise<PayPalNamespace | null> = loadScript({ 'client-id': 'sb' });

loadScript({
    'client-id': 'sb',
    'currency': 'USD',
    'data-order-id': '12345',
    'disable-funding': 'card'
});

loadScript({ 'client-id': 'sb' })
    .then((paypal) => {
        if (!(paypal && paypal.Buttons)) return;

        paypal.Buttons().render('#container');
        paypal.Buttons().render(document.createElement('div'));

        // minimal createOrder payload
        paypal.Buttons({
            createOrder: (data, actions) => {
                return actions.order.create({
                    purchase_units: [{
                        amount: {
                            value: '88.44'
                        }
                    }]
                });
            }
        });

        // createOrder for partners
        // https://developer.paypal.com/docs/platforms/checkout/set-up-payments#create-order
        paypal.Buttons({
            fundingSource: 'paypal',
            createOrder: (data, actions) => {
                return actions.order.create({
                    "intent": "CAPTURE",
                    "purchase_units": [{
                        "amount": {
                            "currency_code": "USD",
                            "value": "100.00"
                        },
                        "payee": {
                            "email_address": "seller@example.com"
                        },
                        "payment_instruction": {
                            "disbursement_mode": "INSTANT",
                            "platform_fees": [{
                                "amount": {
                                    "currency_code": "USD",
                                    "value": "25.00"
                                }
                            }]
                        }
                    }]
                });
            }
        });
    })
    .catch(err => {
        console.error(err);
    });
