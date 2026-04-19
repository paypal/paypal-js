import React, { useEffect } from "react";
import { action } from "@storybook/addon-actions";

import {
    PayPalScriptProvider,
    PayPalButtons,
    PayPalSubscriptionButtons,
    usePayPalScriptReducer,
    SubscriptionStatusResponse,
    DISPATCH_ACTION,
} from "../../index";
import { getOptionsFromQueryString, generateRandomString } from "../utils";
import {
    ORDER_ID,
    APPROVE,
    SUBSCRIPTION,
    ERROR,
    ORDER_INSTANCE_ERROR,
} from "../constants";
import DocPageStructure from "../components/DocPageStructure";
import { InEligibleError, defaultProps } from "../commons";
import { getDefaultCode, getAndroidResilienceCode } from "./code";

import type { FC, ReactElement } from "react";
import type { StoryFn } from "@storybook/react";
import type { DocsContextProps } from "@storybook/addon-docs";
import type { PayPalButtonsComponentProps } from "../../types/paypalButtonTypes";
import type {
    PayPalScriptOptions,
    CreateSubscriptionActions,
    CreateOrderActions,
    OnApproveData,
    OnApproveActions,
} from "@paypal/paypal-js";

const subscriptionOptions: PayPalScriptOptions = {
    clientId: "test",
    components: "buttons",
    vault: true,
    ...getOptionsFromQueryString(),
};

const buttonSubscriptionProps = {
    createSubscription(
        data: Record<string, unknown>,
        actions: CreateSubscriptionActions,
    ) {
        return actions.subscription
            .create({
                plan_id: PLAN_ID,
            })
            .then((orderId) => {
                action("subscriptionOrder")(orderId);
                return orderId;
            });
    },
    style: {
        label: "subscribe",
    },
    ...defaultProps,
};

const buttonOrderProps = () => ({
    createOrder(data: Record<string, unknown>, actions: CreateOrderActions) {
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
                action(ORDER_ID)(orderId);
                return orderId;
            });
    },
    onApprove(data: OnApproveData, actions: OnApproveActions) {
        if (!actions.order) {
            action(ERROR)(ORDER_INSTANCE_ERROR);
            return Promise.reject(ORDER_INSTANCE_ERROR);
        }
        return actions.order.capture().then(function (details) {
            action(APPROVE)(details);
        });
    },
    ...defaultProps,
});

const orderOptions: PayPalScriptOptions = {
    clientId: "test",
    components: "buttons",
    ...getOptionsFromQueryString(),
};

export default {
    id: "example/Subscriptions",
    title: "PayPal/Subscriptions",
    parameters: {
        docs: {
            description: {
                component: `You can use billing plans and subscriptions to create subscriptions that process recurring PayPal payments for physical or digital goods, or services.
A plan includes pricing and billing cycle information that defines the amount and frequency of charge for a subscription.
You can also define a fixed plan, such as a $5 basic plan or a volume or graduated-based plan with pricing tiers based on the quantity purchased.

It relies on the \`<PayPalScriptProvider />\` parent component for managing state related to loading the JS SDK script.
For more information, see [Subscriptions](https://developer.paypal.com/docs/subscriptions/)`,
            },
        },
        controls: { expanded: true },
    },
    argTypes: {
        type: {
            control: "select",
            options: [SUBSCRIPTION, "capture"],
            table: {
                category: "Custom",
                type: { summary: "string" },
                defaultValue: {
                    summary: SUBSCRIPTION,
                },
            },
            description: "Change the PayPal checkout intent.",
        },
    },
    args: {
        type: SUBSCRIPTION,
    },
    decorators: [
        (Story: FC, storyArgs: { args: { type: string } }): ReactElement => {
            const uid = generateRandomString();
            return (
                <PayPalScriptProvider
                    options={{
                        ...subscriptionOptions,
                        dataNamespace: uid,
                        dataUid: uid,
                        intent: storyArgs.args.type,
                    }}
                >
                    <div style={{ minHeight: "250px" }}>
                        <Story />
                    </div>
                </PayPalScriptProvider>
            );
        },
    ],
};

const PLAN_ID = "P-3RX065706M3469222L5IFM4I";

export const Default: FC<{ type: string }> = ({ type }) => {
    // Remember the type and amount props are received from the control panel
    const [, dispatch] = usePayPalScriptReducer();
    const isSubscription = type === SUBSCRIPTION;
    const buttonOptions = isSubscription
        ? buttonSubscriptionProps
        : buttonOrderProps();
    useEffect(() => {
        dispatch({
            type: DISPATCH_ACTION.RESET_OPTIONS,
            value: type === SUBSCRIPTION ? subscriptionOptions : orderOptions,
        });
    }, [type, dispatch]);

    return (
        <PayPalButtons
            forceReRender={[type]}
            {...(buttonOptions as PayPalButtonsComponentProps)}
            style={{ label: isSubscription ? "subscribe" : undefined }}
        >
            <InEligibleError />
        </PayPalButtons>
    );
};

/********************
 * OVERRIDE STORIES *
 *******************/
(Default as StoryFn).parameters = {
    docs: {
        container: ({ context }: { context: DocsContextProps }) => (
            <DocPageStructure
                context={context}
                code={getDefaultCode(
                    context.getStoryContext(context.storyById(context.id)).args
                        .type,
                )}
            />
        ),
    },
};

// ─────────────────────────────────────────────────────────────────────────────
// AndroidResilience Story
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Demonstrates the `PayPalSubscriptionButtons` component — a drop-in
 * replacement for `<PayPalButtons createSubscription={…}>` that transparently
 * handles the Android ghost-popup bug via three defence layers:
 *
 * 1. **Forced redirect** on Android (bypasses the zoid postMessage bridge)
 * 2. **VisibilityChange polling** — when the user returns from a stuck popup,
 *    the backend is polled immediately to check subscription status
 * 3. **Watchdog timer** — closes a stuck window and fires a final poll after
 *    `watchdogTimeoutMs` milliseconds
 * 4. **sessionStorage recovery** — page refreshes during checkout don't strand
 *    the user; the watchdog polls on mount if a pending key is found
 *
 * ---
 * **How to test on Android:**
 * 1. Open this story on a real Android device via your LAN IP.
 * 2. Tap the Subscribe button — a popup or redirect will open.
 * 3. Switch to another app and return — the VisibilityChange handler fires.
 * 4. Check the Storybook actions panel for `pollSubscriptionStatus` calls.
 */
export const AndroidResilience: FC = () => {
    // ── Simulated backend poll ────────────────────────────────────────────
    // In production, replace this with a real fetch to your backend.
    const mockPollSubscriptionStatus = async (): Promise<SubscriptionStatusResponse> => {
        action("pollSubscriptionStatus")("Polling backend for subscription status…");
        return {
            status: "APPROVAL_PENDING",
            subscriptionId: "",
        };
    };

    const handleApproved = (subscriptionId: string) => {
        action("onSubscriptionApproved")(
            `Subscription confirmed as ACTIVE: ${subscriptionId}`,
        );
    };

    const handleError = (err: unknown) => {
        action("onSubscriptionError")(String(err));
    };

    // ── Inline banner for the stuck-popup recovery UX ────────────────────
    const ReturnBanner = () => (
        <div
            style={{
                background: "#fff3cd",
                border: "1px solid #ffc107",
                borderRadius: "6px",
                padding: "12px 16px",
                marginBottom: "16px",
                fontSize: "14px",
                color: "#856404",
            }}
        >
            <strong>&#9888; Android Recovery Active</strong>
            <br />
            If you returned from a blank PayPal page, your subscription status
            is being checked automatically. Please wait a moment.
        </div>
    );

    return (
        <div style={{ maxWidth: "500px", margin: "0 auto", padding: "16px" }}>
            <h3 style={{ fontFamily: "sans-serif", marginBottom: "8px" }}>
                Android-Resilient Subscription Checkout
            </h3>
            <p
                style={{
                    fontFamily: "sans-serif",
                    fontSize: "13px",
                    color: "#555",
                    marginBottom: "16px",
                }}
            >
                On Android, this component automatically switches to redirect
                mode and activates a backend-polling watchdog to recover from
                the PayPal ghost-popup bug.
            </p>

            <ReturnBanner />

            <PayPalSubscriptionButtons
                planId={PLAN_ID}
                returnUrl="https://example.com/return"
                cancelUrl="https://example.com/cancel"
                onSubscriptionApproved={handleApproved}
                onSubscriptionError={handleError}
                pollSubscriptionStatus={mockPollSubscriptionStatus}
                style={{ label: "subscribe" }}
            >
                <InEligibleError text="Subscribe button is not eligible in this environment." />
            </PayPalSubscriptionButtons>

            <details
                style={{
                    marginTop: "24px",
                    fontFamily: "monospace",
                    fontSize: "12px",
                    color: "#333",
                }}
            >
                <summary style={{ cursor: "pointer", userSelect: "none" }}>
                    ▶ Show real-world usage with PayPalSubscriptionButtons
                </summary>
                <pre
                    style={{
                        background: "#f5f5f5",
                        padding: "12px",
                        borderRadius: "4px",
                        overflowX: "auto",
                        marginTop: "8px",
                    }}
                >
                    {`<PayPalSubscriptionButtons
  planId="P-XXXXXXXXXXXXXXXXXXXXXXXXXXXX"
  returnUrl="https://example.com/subscription/return"
  cancelUrl="https://example.com/subscription/cancel"
  onSubscriptionApproved={(id) => router.push('/success?sub=' + id)}
  onSubscriptionError={(err) => showErrorToast(err)}
  pollSubscriptionStatus={() =>
    fetch('/api/subscription/status').then(r => r.json())
  }
  watchdogTimeoutMs={45000}
  watchdogPollIntervalMs={5000}
/>`}
                </pre>
            </details>
        </div>
    );
};

(AndroidResilience as StoryFn).storyName = "Android Resilience (Ghost Popup Fix)";

(AndroidResilience as StoryFn).parameters = {
    docs: {
        description: {
            story: `
### Android Ghost Popup Fix

The PayPal \`zoid\` library communicates via \`postMessage\`. On Android, the OS
may background-kill the parent tab while the popup is open, breaking the ACK
bridge and leaving the popup blank forever (\`No ack for postMessage\`).

**This story demonstrates \`PayPalSubscriptionButtons\`** — a drop-in wrapper that
fixes this with three transparent defence layers:

| Layer | Mechanism | When it fires |
|-------|-----------|---------------|
| 1 — Forced Redirect | Switches to full-page redirect on Android | At render time |
| 2 — VisibilityChange Poll | Polls backend when page becomes visible again | User returns from popup |
| 3 — Watchdog Timer | Closes stuck window, fires final poll | After \`watchdogTimeoutMs\` |

**Backend requirement:** Your \`/api/subscription/status\` endpoint must read
from a **webhook-synced database** — never proxy PayPal directly from the
frontend, as that exposes credentials.
            `,
        },
        container: ({ context }: { context: DocsContextProps }) => (
            <DocPageStructure
                context={context}
                code={getAndroidResilienceCode()}
            />
        ),
    },
};
