/**
 * Code examples for V6 Button components
 */

export const getPayPalOneTimePaymentButtonCode = (): string => `
import { PayPalProvider, PayPalOneTimePaymentButton } from "@paypal/react-paypal-js/sdk-v6";

async function createOrder() {
    const response = await fetch("/api/paypal/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            items: [{ id: "item-1", quantity: 1 }],
        }),
    });
    const data = await response.json();
    return { orderId: data.id };
}

async function onApprove(data) {
    const response = await fetch(\`/api/paypal/capture/\${data.orderId}\`, {
        method: "POST",
    });
    const result = await response.json();
    console.log("Payment captured:", result);
}

export default function App() {
    return (
        <PayPalProvider
            clientId="YOUR_CLIENT_ID"
            components={["paypal-payments"]}
            pageType="checkout"
        >
            <PayPalOneTimePaymentButton
                createOrder={createOrder}
                onApprove={onApprove}
                onCancel={(data) => console.log("Cancelled:", data)}
                onError={(error) => console.error("Error:", error)}
                presentationMode="auto"
                type="checkout"
            />
        </PayPalProvider>
    );
}
`;

export const getVenmoOneTimePaymentButtonCode = (): string => `
import { PayPalProvider, VenmoOneTimePaymentButton } from "@paypal/react-paypal-js/sdk-v6";

async function createOrder() {
    const response = await fetch("/api/paypal/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
    });
    const data = await response.json();
    return { orderId: data.id };
}

export default function App() {
    return (
        <PayPalProvider
            clientId="YOUR_CLIENT_ID"
            components={["venmo-payments"]}
            pageType="checkout"
        >
            <VenmoOneTimePaymentButton
                createOrder={createOrder}
                onApprove={async (data) => {
                    await fetch(\`/api/paypal/capture/\${data.orderId}\`, {
                        method: "POST",
                    });
                }}
                presentationMode="auto"
            />
        </PayPalProvider>
    );
}
`;

export const getPayPalSavePaymentButtonCode = (): string => `
import { PayPalProvider, PayPalSavePaymentButton } from "@paypal/react-paypal-js/sdk-v6";

async function createVaultToken() {
    const response = await fetch("/api/paypal/create-vault-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
    });
    const data = await response.json();
    return { vaultSetupToken: data.id };
}

export default function App() {
    return (
        <PayPalProvider
            clientId="YOUR_CLIENT_ID"
            components={["paypal-payments"]}
            pageType="checkout"
        >
            <PayPalSavePaymentButton
                createVaultToken={createVaultToken}
                onApprove={async (data) => {
                    console.log("Payment method saved:", data.vaultSetupToken);
                }}
                presentationMode="auto"
            />
        </PayPalProvider>
    );
}
`;

export const getPayLaterOneTimePaymentButtonCode = (): string => `
import {
    PayPalProvider,
    PayLaterOneTimePaymentButton,
    useEligibleMethods,
} from "@paypal/react-paypal-js/sdk-v6";

async function createOrder() {
    const response = await fetch("/api/paypal/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
    });
    const data = await response.json();
    return { orderId: data.id };
}

function Checkout() {
    useEligibleMethods({
        payload: {
            currencyCode: "USD",
            paymentFlow: "ONE_TIME_PAYMENT",
        },
    });

    return (
        <PayLaterOneTimePaymentButton
            createOrder={createOrder}
            onApprove={async (data) => {
                await fetch(\`/api/paypal/capture/\${data.orderId}\`, {
                    method: "POST",
                });
            }}
            presentationMode="auto"
        />
    );
}

export default function App() {
    return (
        <PayPalProvider
            clientId="YOUR_CLIENT_ID"
            components={["paypal-payments"]}
            pageType="checkout"
        >
            <Checkout />
        </PayPalProvider>
    );
}
`;

export const getPayPalGuestPaymentButtonCode = (): string => `
import { PayPalProvider, PayPalGuestPaymentButton } from "@paypal/react-paypal-js/sdk-v6";

async function createOrder() {
    const response = await fetch("/api/paypal/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
    });
    const data = await response.json();
    return { orderId: data.id };
}

export default function App() {
    return (
        <PayPalProvider
            clientId="YOUR_CLIENT_ID"
            components={["paypal-guest-payments"]}
            pageType="checkout"
        >
            <PayPalGuestPaymentButton
                createOrder={createOrder}
                onApprove={async (data) => {
                    await fetch(\`/api/paypal/capture/\${data.orderId}\`, {
                        method: "POST",
                    });
                }}
            />
        </PayPalProvider>
    );
}
`;

export const getPayPalSubscriptionButtonCode = (): string => `
import { PayPalProvider, PayPalSubscriptionButton } from "@paypal/react-paypal-js/sdk-v6";

async function createSubscription() {
    const response = await fetch("/api/paypal/create-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
    });
    const data = await response.json();
    return { subscriptionId: data.id };
}

export default function App() {
    return (
        <PayPalProvider
            clientId="YOUR_CLIENT_ID"
            components={["paypal-subscriptions"]}
            pageType="checkout"
        >
            <PayPalSubscriptionButton
                createSubscription={createSubscription}
                onApprove={async (data) => {
                    console.log("Subscription approved:", data.subscriptionId);
                }}
                onCancel={(data) => console.log("Cancelled:", data)}
                onError={(error) => console.error("Error:", error)}
                presentationMode="auto"
                type="subscribe"
            />
        </PayPalProvider>
    );
}
`;

export const getPayPalCreditSavePaymentButtonCode = (): string => `
import {
    PayPalProvider,
    PayPalCreditSavePaymentButton,
    useEligibleMethods,
} from "@paypal/react-paypal-js/sdk-v6";

async function createVaultToken() {
    const response = await fetch("/api/paypal/create-vault-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
    });
    const data = await response.json();
    return { vaultSetupToken: data.id };
}

function Checkout() {
    useEligibleMethods({
        payload: {
            currencyCode: "USD",
            paymentFlow: "VAULT_WITHOUT_PAYMENT",
        },
    });

    return (
        <PayPalCreditSavePaymentButton
            createVaultToken={createVaultToken}
            onApprove={async (data) => {
                console.log("Payment method saved:", data.vaultSetupToken);
            }}
            presentationMode="auto"
        />
    );
}

export default function App() {
    return (
        <PayPalProvider
            clientId="YOUR_CLIENT_ID"
            components={["paypal-payments"]}
            pageType="checkout"
        >
            <Checkout />
        </PayPalProvider>
    );
}
`;

export const getCardFieldsOneTimePaymentCode = (): string => `
import {
    PayPalProvider,
    PayPalCardFieldsProvider,
    PayPalCardNumberField,
    PayPalCardExpiryField,
    PayPalCardCvvField,
    usePayPalCardFields,
    usePayPalCardFieldsOneTimePaymentSession,
} from "@paypal/react-paypal-js/sdk-v6";
import { useEffect } from "react";

async function createOrder() {
    const response = await fetch("/api/paypal/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
    });
    const data = await response.json();
    return { orderId: data.id };
}

async function captureOrder(orderId: string) {
    const response = await fetch(\`/api/paypal/capture/\${orderId}\`, {
        method: "POST",
    });
    return response.json();
}

function CardFieldsForm() {
    const { error: cardFieldsError } = usePayPalCardFields();
    const { error: submitError, submit, submitResponse } =
        usePayPalCardFieldsOneTimePaymentSession();

    useEffect(() => {
        if (!submitResponse) return;

        const { orderId, message } = submitResponse.data;

        switch (submitResponse.state) {
            case "succeeded":
                captureOrder(orderId).then((result) => {
                    console.log("Payment captured:", result);
                });
                break;
            case "failed":
                console.error("Payment failed:", message);
                break;
        }
    }, [submitResponse]);

    const handleSubmit = async () => {
        const { orderId } = await createOrder();
        await submit(orderId);
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <PayPalCardNumberField
                containerStyles={{ height: "3rem" }}
                placeholder="Enter card number"
            />
            <PayPalCardExpiryField
                containerStyles={{ height: "3rem" }}
                placeholder="MM/YY"
            />
            <PayPalCardCvvField
                containerStyles={{ height: "3rem" }}
                placeholder="Enter CVV"
            />
            {!cardFieldsError && (
                <button onClick={handleSubmit}>Pay</button>
            )}
        </div>
    );
}

export default function App() {
    return (
        <PayPalProvider
            clientId="YOUR_CLIENT_ID"
            components={["card-fields"]}
            pageType="checkout"
        >
            <PayPalCardFieldsProvider>
                <CardFieldsForm />
            </PayPalCardFieldsProvider>
        </PayPalProvider>
    );
}
`;
