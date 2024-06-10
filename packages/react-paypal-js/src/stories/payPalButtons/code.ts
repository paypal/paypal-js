import {
    generateFundingSource,
    CREATE_ORDER_URL,
    CAPTURE_ORDER_URL,
} from "../utils";

import type { Args } from "@storybook/addons/dist/ts3.9/types";

export const getDefaultCode = (args: Args): string =>
    `
import {
    PayPalScriptProvider,
    PayPalButtons,
    usePayPalScriptReducer
} from "@paypal/react-paypal-js";

// This value is from the props in the UI
const style = ${JSON.stringify(args.style)};

function createOrder() {
    // replace this url with your server
    return fetch("${CREATE_ORDER_URL}", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        // use the "body" param to optionally pass additional order information
        // like product ids and quantities
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
            // Your code here after create the order
            return order.id;
        });
}
function onApprove(data) {
    // replace this url with your server
    return fetch("${CAPTURE_ORDER_URL}", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            orderID: data.orderID,
        }),
    })
        .then((response) => response.json())
        .then((orderData) => {
            // Your code here after capture the order
        });
}

// Custom component to wrap the PayPalButtons and show loading spinner
const ButtonWrapper = ({ showSpinner }) => {
    const [{ isPending }] = usePayPalScriptReducer();

    return (
        <>
            { (showSpinner && isPending) && <div className="spinner" /> }
            <PayPalButtons
                style={style}
                disabled={${args.disabled}}
                forceReRender={[style]}
                ${generateFundingSource(args.fundingSource as string)}
                createOrder={createOrder}
                onApprove={onApprove}
            />
        </>
    );
}

export default function App() {
    return (
        <div style={{ maxWidth: "${args.size}px", minHeight: "200px" }}>
            <PayPalScriptProvider options={{ clientId: "test", components: "buttons", currency: "USD" }}>
                <ButtonWrapper showSpinner={${args.showSpinner}} />
            </PayPalScriptProvider>
        </div>
    );
}`;

export const getDonateCode = (args: Args): string =>
    `
import {
    PayPalScriptProvider,
    PayPalButtons,
    usePayPalScriptReducer
} from "@paypal/react-paypal-js";

// This value is from the props in the UI
const style = ${JSON.stringify(args.style)};

function createOrder() {
    // replace this url with your server
    return fetch("${CREATE_ORDER_URL}", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        // use the "body" param to optionally pass additional order information
        // like product ids and quantities
        body: JSON.stringify({
            cart: [
                {
                    sku: "etanod01",
                    quantity: 1,
                },
            ],
        }),
    })
        .then((response) => response.json())
        .then((order) => {
            // Your code here after create the order
            return order.id;
        });
}
function onApprove(data) {
    // replace this url with your server
    return fetch("${CAPTURE_ORDER_URL}", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            orderID: data.orderID,
        }),
    })
        .then((response) => response.json())
        .then((orderData) => {
            // Your code here after capture the order
        });
}

// Custom component to wrap the PayPalButtons and show loading spinner
const ButtonWrapper = ({ showSpinner }) => {
    const [{ isPending }] = usePayPalScriptReducer();

    return (
        <>
            { (showSpinner && isPending) && <div className="spinner" /> }
            <PayPalButtons
                fundingSource="paypal"
                style={${JSON.stringify({
                    ...(args.style as Record<string, unknown>),
                    label: "donate",
                })}}
                disabled={${args.disabled}}
                forceReRender={[style]}
                createOrder={createOrder}
                onApprove={onApprove}
            />
        </>
    );
}

export default function App() {
    return (
        <div style={{ maxWidth: "${args.size}px", minHeight: "200px" }}>
            <PayPalScriptProvider options={{ clientId: "test", components: "buttons", currency: "USD" }}>
                <ButtonWrapper showSpinner={${args.showSpinner}} />
            </PayPalScriptProvider>
        </div>
    );
}`;
