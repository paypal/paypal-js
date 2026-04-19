import { SUBSCRIPTION } from "../constants";

const SUBSCRIPTION_OPTIONS = `createSubscription={(data, actions) => {
			return actions.subscription
				.create({
					plan_id: "P-3RX065706M3469222L5IFM4I",
				})
				.then((orderId) => {
					// Your code here after create the order
					return orderId;
				});
		}}
		style={{
			label: "subscribe",
		}}`;

const CAPTURE_OPTIONS = `createOrder={function (data, actions) {
			return actions.order
				.create({
					intent: "CAPTURE",
					purchase_units: [
						{
							amount: {
								currency_code: "USD",
								value: "2",
							},
						},
					],
				})
				.then((orderId) => {
					// Your code here after create the order
					return orderId;
				});
		}}
		onApprove={function (data, actions) {
			return actions.order.capture().then(function (details) {
				// Your code here after capture the order
			});
		}}`;

export const getDefaultCode = (type: string): string =>
    `import { useEffect } from "react";
import {
	PayPalScriptProvider,
	PayPalButtons,
	usePayPalScriptReducer
} from "@paypal/react-paypal-js";

const ButtonWrapper = ({ type }) => {
	const [{ options }, dispatch] = usePayPalScriptReducer();

	useEffect(() => {
        dispatch({
            type: "resetOptions",
            value: {
                ...options,
                intent: "${type === SUBSCRIPTION ? "subscription" : "capture"}",
            },
        });
    }, [type]);

	return (<PayPalButtons
		${type === SUBSCRIPTION ? SUBSCRIPTION_OPTIONS : CAPTURE_OPTIONS}
	/>);
}

export default function App() {
	return (
		<PayPalScriptProvider
			options={{
				clientId: "test",
				components: "buttons",
				intent: "${type}",
				vault: ${type === SUBSCRIPTION},
			}}
		>
			<ButtonWrapper type="${type}" />
		</PayPalScriptProvider>
	);
}`;

// ─────────────────────────────────────────────────────────────────────────────
// Android Resilience — copy-paste example for the AndroidResilience story
// ─────────────────────────────────────────────────────────────────────────────

export const getAndroidResilienceCode = (): string =>
    `/**
 * PayPalSubscriptionButtons — Android Resilience Pattern
 *
 * Drop-in for <PayPalButtons createSubscription={...}> that transparently:
 *   1. Forces full-page redirect on Android (bypasses the buggy postMessage bridge)
 *   2. Polls your backend via a VisibilityChange listener when the user returns
 *      from a blank/stuck popup (the "ghost popup" bug)
 *   3. Activates a watchdog timer that closes a stuck popup and fires one final
 *      backend poll after a configurable timeout
 *   4. Stores a recovery key in sessionStorage so page refreshes don't strand users
 *
 * Requirements:
 *   - returnUrl must be registered in your PayPal Developer Dashboard
 *   - /api/subscription/status must be your OWN backend endpoint reading
 *     from a webhook-synced DB — never proxy PayPal directly from the frontend
 */
import {
    PayPalScriptProvider,
    PayPalSubscriptionButtons,
} from "@paypal/react-paypal-js";

// ── Backend polling function ─────────────────────────────────────────────────
// This calls YOUR server, which reads from a DB synced by PayPal webhooks.
// Shape: { status: "ACTIVE" | "APPROVAL_PENDING" | ..., subscriptionId: string }
async function pollSubscriptionStatus() {
    const res = await fetch("/api/subscription/status", {
        credentials: "include",
        headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) throw new Error("Failed to fetch subscription status");
    return res.json();
}

// ── Component ────────────────────────────────────────────────────────────────
export default function SubscriptionPage() {
    function handleApproved(subscriptionId) {
        // subscriptionId is definitive — sourced from either the SDK onApprove
        // (desktop) or a confirmed backend webhook (Android).
        console.log("Subscription active:", subscriptionId);
        window.location.href = "/subscription/success?id=" + subscriptionId;
    }

    function handleError(err) {
        console.error("Subscription error:", err);
        // Show an appropriate UI — watchdog timeout, SDK error, etc.
    }

    return (
        <PayPalScriptProvider
            options={{
                clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID,
                components: "buttons",
                intent: "subscription",
                vault: true,
            }}
        >
            <PayPalSubscriptionButtons
                // ── Required ──────────────────────────────────────────────
                planId="P-XXXXXXXXXXXXXXXXXXXXXXXXXXXX"
                returnUrl="https://example.com/subscription/return"
                cancelUrl="https://example.com/subscription/cancel"
                onSubscriptionApproved={handleApproved}
                pollSubscriptionStatus={pollSubscriptionStatus}

                // ── Optional ──────────────────────────────────────────────
                onSubscriptionError={handleError}

                // Watchdog timeout before onSubscriptionError fires (ms)
                watchdogTimeoutMs={45000}

                // How often the watchdog polls your backend (ms)
                watchdogPollIntervalMs={5000}

                // Standard PayPalButtons style props still work
                style={{ layout: "vertical", color: "gold" }}
            />
        </PayPalScriptProvider>
    );
}`;

