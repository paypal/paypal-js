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

        paypal.Buttons({
            fundingSource: 'PAYPAL',
            createOrder: (data, actions) => {
                return actions.order.create({
                    intent: 'AUTHORIZE',
                    purchase_units: [
                        {
                            amount: {
                                value: '1.20',
                                currency_code: 'USD'
                            }
                        }
                    ]
                });
            }
        });
    })
    .catch(err => {
        console.error(err);
    });
