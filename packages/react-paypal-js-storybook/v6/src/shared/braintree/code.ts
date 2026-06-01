/**
 * Copy-paste snippets shown in the Braintree story docs pages.
 * Each snippet is a complete, self-contained React app — merchants should be
 * able to drop the whole string into App.tsx and run it (after wiring up the
 * /braintree-api endpoints on their own server).
 */

const HTML_PREREQ = `// IMPORTANT: load the Braintree client and paypal-checkout-v6 scripts in
// your HTML <head> before rendering this app:
//   <script src="https://js.braintreegateway.com/web/3.142.0/js/client.min.js"></script>
//   <script src="https://js.braintreegateway.com/web/3.142.0/js/paypal-checkout-v6.min.js"></script>`;

const TOKEN_FETCH_HELPER = `async function getBraintreeClientToken(): Promise<string> {
    const response = await fetch("/braintree-api/auth/browser-safe-client-token");
    const { clientToken } = await response.json();
    return clientToken;
}`;

const APP_SHELL = (providerChildrenComponent: string) => `function App() {
    const [clientToken, setClientToken] = useState<string | undefined>(undefined);

    useEffect(() => {
        getBraintreeClientToken().then(setClientToken);
    }, []);

    if (!clientToken) return <div>Loading...</div>;

    return (
        <BraintreePayPalProvider
            namespace={window.braintree}
            braintreeClientToken={clientToken}
        >
            <${providerChildrenComponent} />
        </BraintreePayPalProvider>
    );
}`;

// ─── OneTime ────────────────────────────────────────────────────────────────

export const getBraintreeOneTimePaymentButtonCode = (): string => `
${HTML_PREREQ}
import { useEffect, useState } from "react";
import {
    BraintreePayPalProvider,
    BraintreePayPalOneTimePaymentButton,
    INSTANCE_LOADING_STATE,
    useBraintreePayPal,
} from "@paypal/react-paypal-js/sdk-v6";
import type {
    BraintreeApprovalData,
    BraintreeV6Namespace,
} from "@paypal/react-paypal-js/sdk-v6";

declare global {
    interface Window {
        braintree: BraintreeV6Namespace;
    }
}

${TOKEN_FETCH_HELPER}

async function completePayment(nonce: string, amount: string) {
    const response = await fetch("/braintree-api/transaction/sale", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentMethodNonce: nonce, amount }),
    });
    return response.json();
}

function CheckoutButton() {
    const { braintreePayPalCheckoutInstance, loadingStatus } = useBraintreePayPal();

    if (
        loadingStatus !== INSTANCE_LOADING_STATE.RESOLVED ||
        !braintreePayPalCheckoutInstance
    ) {
        return null;
    }

    return (
        <BraintreePayPalOneTimePaymentButton
            amount="10.00"
            currency="USD"
            type="pay"
            presentationMode="auto"
            onApprove={async (data: BraintreeApprovalData) => {
                const { nonce } = await braintreePayPalCheckoutInstance.tokenizePayment({
                    orderID: data.orderId,
                    payerID: data.payerId,
                });
                const result = await completePayment(nonce, "10.00");
                console.log("Payment captured:", result);
            }}
            onCancel={(data) => console.log("Cancelled:", data)}
            onError={(error) => console.error("Error:", error)}
        />
    );
}

${APP_SHELL("CheckoutButton")}
`;

// ─── BillingAgreement ───────────────────────────────────────────────────────

export const getBraintreeBillingAgreementButtonCode = (): string => `
${HTML_PREREQ}
import { useEffect, useState } from "react";
import {
    BraintreePayPalProvider,
    BraintreePayPalBillingAgreementButton,
    INSTANCE_LOADING_STATE,
    useBraintreePayPal,
} from "@paypal/react-paypal-js/sdk-v6";
import type {
    BraintreeApprovalData,
    BraintreeV6Namespace,
} from "@paypal/react-paypal-js/sdk-v6";

declare global {
    interface Window {
        braintree: BraintreeV6Namespace;
    }
}

${TOKEN_FETCH_HELPER}

async function vaultPaymentMethod(nonce: string) {
    const response = await fetch("/braintree-api/payment-method/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentMethodNonce: nonce }),
    });
    return response.json();
}

function SavePayPalButton() {
    const { braintreePayPalCheckoutInstance, loadingStatus } = useBraintreePayPal();

    if (
        loadingStatus !== INSTANCE_LOADING_STATE.RESOLVED ||
        !braintreePayPalCheckoutInstance
    ) {
        return null;
    }

    return (
        <BraintreePayPalBillingAgreementButton
            billingAgreementDescription="Save PayPal account for future payments"
            type="pay"
            presentationMode="auto"
            onApprove={async (data: BraintreeApprovalData) => {
                // BillingAgreement tokenizes via billingToken — not orderID/payerID,
                // which is what the OneTime and CheckoutWithVault flows use.
                const { nonce } = await braintreePayPalCheckoutInstance.tokenizePayment({
                    billingToken: data.billingToken,
                });
                const result = await vaultPaymentMethod(nonce);
                console.log("Payment method vaulted:", result);
            }}
            onCancel={(data) => console.log("Cancelled:", data)}
            onError={(error) => console.error("Error:", error)}
        />
    );
}

${APP_SHELL("SavePayPalButton")}
`;

// ─── CheckoutWithVault ──────────────────────────────────────────────────────

export const getBraintreeCheckoutWithVaultButtonCode = (): string => `
${HTML_PREREQ}
import { useEffect, useState } from "react";
import {
    BraintreePayPalProvider,
    BraintreePayPalCheckoutWithVaultButton,
    INSTANCE_LOADING_STATE,
    useBraintreePayPal,
} from "@paypal/react-paypal-js/sdk-v6";
import type {
    BraintreeApprovalData,
    BraintreeV6Namespace,
} from "@paypal/react-paypal-js/sdk-v6";

declare global {
    interface Window {
        braintree: BraintreeV6Namespace;
    }
}

${TOKEN_FETCH_HELPER}

async function completePaymentAndVault(nonce: string, amount: string) {
    const response = await fetch("/braintree-api/transaction/sale", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            paymentMethodNonce: nonce,
            amount,
            options: { storeInVaultOnSuccess: true },
        }),
    });
    return response.json();
}

function CheckoutAndSaveButton() {
    const { braintreePayPalCheckoutInstance, loadingStatus } = useBraintreePayPal();

    if (
        loadingStatus !== INSTANCE_LOADING_STATE.RESOLVED ||
        !braintreePayPalCheckoutInstance
    ) {
        return null;
    }

    return (
        <BraintreePayPalCheckoutWithVaultButton
            amount="10.00"
            currency="USD"
            billingAgreementDetails={{ description: "Save payment method for future purchases" }}
            type="pay"
            presentationMode="auto"
            onApprove={async (data: BraintreeApprovalData) => {
                const { nonce } = await braintreePayPalCheckoutInstance.tokenizePayment({
                    orderID: data.orderId,
                    payerID: data.payerId,
                });
                const result = await completePaymentAndVault(nonce, "10.00");
                console.log("Captured and vaulted:", result);
            }}
            onCancel={() => console.log("Cancelled")}
            onError={(error) => console.error("Error:", error)}
        />
    );
}

${APP_SHELL("CheckoutAndSaveButton")}
`;
