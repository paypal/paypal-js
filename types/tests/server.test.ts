import type {
    CreateOrderRequestBody,
    OrderResponseBodyMinimal,
    UpdateOrderRequestBody,
} from "../index";

function createOrder(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    createOrderRequestBody: CreateOrderRequestBody
): Promise<OrderResponseBodyMinimal> {
    return Promise.resolve({ id: "123456", status: "CREATED", links: [] });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function updateOrder(options: {
    orderID: string;
    requestBody: UpdateOrderRequestBody;
}): Promise<void> {
    return Promise.resolve();
}

// capture
createOrder({
    intent: "CAPTURE",
    purchase_units: [
        {
            amount: {
                value: "88.44",
            },
        },
    ],
});

// authorize
createOrder({
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

// pass payee and payment_instruction for partner use case
createOrder({
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

// shipping.options array
createOrder({
    purchase_units: [
        {
            amount: {
                value: "15.00",
                currency_code: "USD",
            },

            shipping: {
                options: [
                    {
                        id: "SHIP_123",
                        label: "Free Shipping",
                        type: "SHIPPING",
                        selected: true,
                        amount: {
                            value: "3.00",
                            currency_code: "USD",
                        },
                    },
                    {
                        id: "SHIP_456",
                        label: "Pick up in Store",
                        type: "PICKUP",
                        selected: false,
                        amount: {
                            value: "0.00",
                            currency_code: "USD",
                        },
                    },
                ],
            },
        },
    ],
});

// shipping info
createOrder({
    purchase_units: [
        {
            amount: {
                value: "88.44",
                currency_code: "USD",
            },
            shipping: {
                name: {
                    full_name: "Jon Doe",
                },
                email_address: "jon@test.com",
                type: "SHIPPING",
            },
        },
    ],
});

// donation
createOrder({
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

// paypal payment_source
createOrder({
    intent: "CAPTURE",
    purchase_units: [
        {
            amount: {
                value: "88.44",
            },
        },
    ],
    payment_source: {
        paypal: {
            experience_context: {
                user_action: "CONTINUE",
                return_url: "https://www.example.com/capture-checkout",
                cancel_url: "https://www.example.com/cancel-checkout",
            },
        },
    },
});

updateOrder({
    orderID: "42P22220TW111111R",
    requestBody: [
        {
            op: "replace",
            path: "/purchase_units/@reference_id=='default'/amount",
            value: {
                value: "10.25",
                currency: "USD",
            },
        },
    ],
});

updateOrder({
    orderID: "42P22220TW111111R",
    requestBody: [
        {
            op: "remove",
            path: "/purchase_units/@reference_id=='default'/invoice_id",
        },
    ],
});
