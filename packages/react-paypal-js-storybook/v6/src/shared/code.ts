/**
 * Code examples for V6 Button components
 *
 * Each button with XOR props (e.g., createOrder vs orderId) has two code examples:
 * - A "lazy" (recommended) example where the resource is created on button click
 * - An "eager" example where the resource is pre-created before rendering
 */

// ─── PayPalOneTimePaymentButton ─────────────────────────────────────────────

export const getPayPalOneTimePaymentButtonCode = (): string => `
// Option 1: Lazy order creation (Recommended)
// The order is created only when the buyer clicks the button.
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

export const getPayPalOneTimePaymentButtonEagerCode = (): string => `
// Option 2: Eager order creation
// The order is created on page load and passed directly as a prop.
// Useful when you need to create the order before the button renders
// (e.g., server-side order creation, or shared order across multiple buttons).
import { useEffect, useState } from "react";
import { PayPalProvider, PayPalOneTimePaymentButton } from "@paypal/react-paypal-js/sdk-v6";

function Checkout() {
    const [orderId, setOrderId] = useState<string | null>(null);

    useEffect(() => {
        fetch("/api/paypal/create-order", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
        })
            .then((res) => res.json())
            .then((data) => setOrderId(data.id));
    }, []);

    if (!orderId) return <div>Loading...</div>;

    return (
        <PayPalOneTimePaymentButton
            orderId={orderId}
            onApprove={async (data) => {
                await fetch(\`/api/paypal/capture/\${data.orderId}\`, {
                    method: "POST",
                });
            }}
            onCancel={(data) => console.log("Cancelled:", data)}
            onError={(error) => console.error("Error:", error)}
            presentationMode="auto"
            type="checkout"
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

// ─── VenmoOneTimePaymentButton ──────────────────────────────────────────────

export const getVenmoOneTimePaymentButtonCode = (): string => `
// Option 1: Lazy order creation (Recommended)
// The order is created only when the buyer clicks the button.
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

export const getVenmoOneTimePaymentButtonEagerCode = (): string => `
// Option 2: Eager order creation
// The order is created on page load and passed directly as a prop.
import { useEffect, useState } from "react";
import { PayPalProvider, VenmoOneTimePaymentButton } from "@paypal/react-paypal-js/sdk-v6";

function Checkout() {
    const [orderId, setOrderId] = useState<string | null>(null);

    useEffect(() => {
        fetch("/api/paypal/create-order", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
        })
            .then((res) => res.json())
            .then((data) => setOrderId(data.id));
    }, []);

    if (!orderId) return <div>Loading...</div>;

    return (
        <VenmoOneTimePaymentButton
            orderId={orderId}
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
            components={["venmo-payments"]}
            pageType="checkout"
        >
            <Checkout />
        </PayPalProvider>
    );
}
`;

// ─── PayPalSavePaymentButton ────────────────────────────────────────────────

export const getPayPalSavePaymentButtonCode = (): string => `
// Option 1: Lazy vault token creation (Recommended)
// The vault setup token is created only when the buyer clicks the button.
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

export const getPayPalSavePaymentButtonEagerCode = (): string => `
// Option 2: Eager vault token creation
// The vault setup token is created on page load and passed directly as a prop.
import { useEffect, useState } from "react";
import { PayPalProvider, PayPalSavePaymentButton } from "@paypal/react-paypal-js/sdk-v6";

function Checkout() {
    const [vaultSetupToken, setVaultSetupToken] = useState<string | null>(null);

    useEffect(() => {
        fetch("/api/paypal/create-vault-token", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
        })
            .then((res) => res.json())
            .then((data) => setVaultSetupToken(data.id));
    }, []);

    if (!vaultSetupToken) return <div>Loading...</div>;

    return (
        <PayPalSavePaymentButton
            vaultSetupToken={vaultSetupToken}
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

// ─── PayLaterOneTimePaymentButton ───────────────────────────────────────────

export const getPayLaterOneTimePaymentButtonCode = (): string => `
// Option 1: Lazy order creation (Recommended)
// The order is created only when the buyer clicks the button.
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

export const getPayLaterOneTimePaymentButtonEagerCode = (): string => `
// Option 2: Eager order creation
// The order is created on page load and passed directly as a prop.
import { useEffect, useState } from "react";
import {
    PayPalProvider,
    PayLaterOneTimePaymentButton,
    useEligibleMethods,
} from "@paypal/react-paypal-js/sdk-v6";

function Checkout() {
    const [orderId, setOrderId] = useState<string | null>(null);

    useEligibleMethods({
        payload: {
            currencyCode: "USD",
            paymentFlow: "ONE_TIME_PAYMENT",
        },
    });

    useEffect(() => {
        fetch("/api/paypal/create-order", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
        })
            .then((res) => res.json())
            .then((data) => setOrderId(data.id));
    }, []);

    if (!orderId) return <div>Loading...</div>;

    return (
        <PayLaterOneTimePaymentButton
            orderId={orderId}
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

// ─── PayPalGuestPaymentButton ───────────────────────────────────────────────

export const getPayPalGuestPaymentButtonCode = (): string => `
// Option 1: Lazy order creation (Recommended)
// The order is created only when the buyer clicks the button.
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

export const getPayPalGuestPaymentButtonEagerCode = (): string => `
// Option 2: Eager order creation
// The order is created on page load and passed directly as a prop.
import { useEffect, useState } from "react";
import { PayPalProvider, PayPalGuestPaymentButton } from "@paypal/react-paypal-js/sdk-v6";

function Checkout() {
    const [orderId, setOrderId] = useState<string | null>(null);

    useEffect(() => {
        fetch("/api/paypal/create-order", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
        })
            .then((res) => res.json())
            .then((data) => setOrderId(data.id));
    }, []);

    if (!orderId) return <div>Loading...</div>;

    return (
        <PayPalGuestPaymentButton
            orderId={orderId}
            onApprove={async (data) => {
                await fetch(\`/api/paypal/capture/\${data.orderId}\`, {
                    method: "POST",
                });
            }}
        />
    );
}

export default function App() {
    return (
        <PayPalProvider
            clientId="YOUR_CLIENT_ID"
            components={["paypal-guest-payments"]}
            pageType="checkout"
        >
            <Checkout />
        </PayPalProvider>
    );
}
`;

// ─── PayPalSubscriptionButton (no XOR pattern) ─────────────────────────────

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

// ─── PayPalCreditSavePaymentButton ──────────────────────────────────────────

export const getPayPalCreditSavePaymentButtonCode = (): string => `
// Option 1: Lazy vault token creation (Recommended)
// The vault setup token is created only when the buyer clicks the button.
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

export const getPayPalCreditSavePaymentButtonEagerCode = (): string => `
// Option 2: Eager vault token creation
// The vault setup token is created on page load and passed directly as a prop.
import { useEffect, useState } from "react";
import {
    PayPalProvider,
    PayPalCreditSavePaymentButton,
    useEligibleMethods,
} from "@paypal/react-paypal-js/sdk-v6";

function Checkout() {
    const [vaultSetupToken, setVaultSetupToken] = useState<string | null>(null);

    useEligibleMethods({
        payload: {
            currencyCode: "USD",
            paymentFlow: "VAULT_WITHOUT_PAYMENT",
        },
    });

    useEffect(() => {
        fetch("/api/paypal/create-vault-token", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
        })
            .then((res) => res.json())
            .then((data) => setVaultSetupToken(data.id));
    }, []);

    if (!vaultSetupToken) return <div>Loading...</div>;

    return (
        <PayPalCreditSavePaymentButton
            vaultSetupToken={vaultSetupToken}
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

// ─── Card Fields ────────────────────────────────────────────────────────────

export const getCardFieldsOneTimePaymentCode = (): string => `
// Option 1: One-Time Payment (Recommended for standard checkout)
// Create an order, then submit the card details to capture payment.
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

export const getCardFieldsSavePaymentCode = (): string => `
// Option 2: Save Payment Method (for vaulting cards without immediate payment)
// Create a vault setup token, then submit the card details to save the payment method.
import {
    PayPalProvider,
    PayPalCardFieldsProvider,
    PayPalCardNumberField,
    PayPalCardExpiryField,
    PayPalCardCvvField,
    usePayPalCardFields,
    usePayPalCardFieldsSavePaymentSession,
} from "@paypal/react-paypal-js/sdk-v6";
import { useEffect } from "react";

async function createVaultSetupToken() {
    const response = await fetch("/api/paypal/create-vault-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
    });
    const data = await response.json();
    return data.id;
}

function CardFieldsForm() {
    const { error: cardFieldsError } = usePayPalCardFields();
    const { error: submitError, submit, submitResponse } =
        usePayPalCardFieldsSavePaymentSession();

    useEffect(() => {
        if (!submitResponse) return;

        const { vaultSetupToken, message } = submitResponse.data;

        switch (submitResponse.state) {
            case "succeeded":
                console.log("Card saved successfully:", vaultSetupToken);
                break;
            case "failed":
                console.error("Save failed:", message);
                break;
        }
    }, [submitResponse]);

    const handleSubmit = async () => {
        const vaultSetupToken = await createVaultSetupToken();
        await submit(vaultSetupToken);
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
                <button onClick={handleSubmit}>Save Card</button>
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
