import type { Meta, StoryObj } from "@storybook/react";

import {
    ApplePayOneTimePaymentButton,
    useEligibleMethods,
} from "@paypal/react-paypal-js/sdk-v6";
import type {
    UseApplePayOneTimePaymentSessionProps,
    ConfirmOrderResponse,
} from "@paypal/react-paypal-js/sdk-v6";
import {
    createOrder,
    applePayCallbacks,
    applePayButtonStyleArgType,
    applePayButtonTypeArgType,
    disabledArgType,
} from "../../shared/utils";
import { V6DocPageStructure } from "../../components";
import { getApplePayOneTimePaymentButtonCode } from "../../shared/code";

type ApplePayStoryArgs = {
    paymentRequest: UseApplePayOneTimePaymentSessionProps["paymentRequest"];
    createOrder: () => Promise<{ orderId: string }>;
    onApprove: (data: ConfirmOrderResponse) => void | Promise<void>;
    onCancel?: () => void;
    onError?: (error: Error) => void;
    applePaySessionVersion: number;
    displayName?: string;
    domainName?: string;
    buttonstyle?: "black" | "white" | "white-outline";
    type?: string;
    locale?: string;
    disabled?: boolean;
};

/**
 * Wrapper that demonstrates the recommended Apple Pay integration flow:
 * 1. Check canMakePayments() for browser/device support
 * 2. Call useEligibleMethods() to fetch applePayConfig
 * 3. Pass config explicitly to ApplePayOneTimePaymentButton
 *
 * Note: useEligibleMethods is called unconditionally due to React's rules of
 * hooks, but merchants can gate the eligibility call in their own code by
 * splitting the check and the button into separate components.
 */
function ApplePayStoryWrapper(args: ApplePayStoryArgs) {
    let canUseApplePay = false;
    try {
        canUseApplePay =
            typeof window !== "undefined" &&
            !!window.ApplePaySession?.canMakePayments();
    } catch {
        // canMakePayments() throws on non-HTTPS (InvalidAccessError)
    }

    const {
        eligiblePaymentMethods,
        isLoading: isEligibilityLoading,
        error: eligibilityError,
    } = useEligibleMethods({
        payload: { currencyCode: "USD" },
    });

    if (!canUseApplePay) {
        const isSafari =
            typeof navigator !== "undefined" &&
            /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
        const isHttps =
            typeof window !== "undefined" &&
            window.location.protocol === "https:";

        let message: string;
        if (!isSafari && !isHttps) {
            message =
                "Apple Pay requires Safari and HTTPS. The button will not render or function in this environment.";
        } else if (!isSafari) {
            message =
                "Apple Pay requires Safari. The button will not render in this browser.";
        } else if (!isHttps) {
            message =
                "Apple Pay requires HTTPS. The button will not render over an insecure connection. Use ngrok or deploy to HTTPS to preview.";
        } else {
            message =
                "Apple Pay is not available on this device. Ensure Apple Pay is configured in Wallet.";
        }

        return (
            <div
                style={{
                    padding: "12px 16px",
                    border: "1px solid #e2e8f0",
                    borderRadius: "4px",
                    backgroundColor: "#f7fafc",
                    color: "#4a5568",
                    fontSize: "14px",
                    lineHeight: "1.5",
                }}
            >
                <strong>Note</strong>
                <p style={{ margin: "4px 0 0" }}>{message}</p>
            </div>
        );
    }

    if (isEligibilityLoading) {
        return <div>Checking Apple Pay eligibility...</div>;
    }

    if (eligibilityError) {
        return (
            <div style={{ color: "#c53030" }}>
                Failed to check eligibility: {eligibilityError.message}
            </div>
        );
    }

    const isEligible = eligiblePaymentMethods?.isEligible("applepay");
    const applePayConfig =
        eligiblePaymentMethods?.getDetails("applepay")?.config;

    if (!isEligible || !applePayConfig) {
        return (
            <div
                style={{
                    padding: "12px 16px",
                    border: "1px solid #ffeeba",
                    borderRadius: "4px",
                    backgroundColor: "#fff3cd",
                    color: "#856404",
                    fontSize: "14px",
                }}
            >
                Apple Pay is not eligible for this merchant/environment.
            </div>
        );
    }

    const { buttonstyle, type, locale, disabled, ...hookProps } = args;

    return (
        <ApplePayOneTimePaymentButton
            applePayConfig={applePayConfig}
            buttonstyle={buttonstyle}
            type={type}
            locale={locale}
            disabled={disabled}
            {...hookProps}
        />
    );
}

const meta: Meta<ApplePayStoryArgs> = {
    title: "V6/Buttons/ApplePayOneTimePaymentButton",
    tags: ["autodocs"],
    parameters: {
        controls: { expanded: true },
        docs: {
            description: {
                component: `Apple Pay one-time payment button powered by the PayPal SDK.

This component renders Apple's native \`<apple-pay-button>\` and manages the full Apple Pay payment flow — including merchant validation, payment authorization, and order confirmation — via the PayPal SDK.

**Requirements:**
- Safari browser (macOS 10.12+ / iOS 10+)
- HTTPS connection
- Apple Pay configured on the user's device
- Apple Pay JS SDK loaded via \`<script crossorigin src="https://applepay.cdn-apple.com/jsapi/1.latest/apple-pay-sdk.js"></script>\`

**Merchant responsibilities (before rendering this component):**
1. Check \`window.ApplePaySession?.canMakePayments()\` — only render the button if this returns \`true\`. This avoids unnecessary API calls on unsupported browsers.
2. Call \`useEligibleMethods()\` to fetch eligibility and obtain \`applePayConfig\` from \`getDetails("applepay").config\`.
3. Pass \`applePayConfig\` explicitly to the component — this is a required prop.

**Key differences from other PayPal buttons:**
- No \`presentationMode\` — Apple controls the native payment sheet
- No eager order creation (\`orderId\` prop) — orders are always created lazily during payment authorization
- \`applePayConfig\` is required and must come from \`useEligibleMethods()\`
- \`onApprove\` receives \`ConfirmOrderResponse\` — the merchant should call \`captureOrder\` with \`data.approveApplePayPayment.id\`

It relies on the \`<PayPalProvider />\` parent component with \`components={["applepay-payments"]}\`.
`,
            },
            page: () => (
                <V6DocPageStructure
                    code={getApplePayOneTimePaymentButtonCode()}
                />
            ),
        },
    },
    argTypes: {
        buttonstyle: applePayButtonStyleArgType,
        type: applePayButtonTypeArgType,
        locale: {
            control: { type: "text" },
            description:
                "Locale for the Apple Pay button (e.g., 'en', 'fr', 'ja')",
        },
        disabled: disabledArgType,
        createOrder: {
            description:
                "Function that creates an order and returns `{ orderId }`. Called during payment authorization after the buyer approves.",
            table: { category: "Events" },
        },
        onApprove: {
            description:
                "Called after the payment is confirmed with PayPal. Receives `ConfirmOrderResponse` — use `data.approveApplePayPayment.id` to capture the order.",
            table: { category: "Events" },
        },
        onCancel: {
            description:
                "Called when the buyer dismisses the Apple Pay payment sheet.",
            table: { category: "Events" },
        },
        onError: {
            description:
                "Called when an error occurs during the Apple Pay flow (e.g., merchant validation failure, network error).",
            table: { category: "Events" },
        },
        applePaySessionVersion: {
            control: { type: "number", min: 4 },
            description:
                "Apple Pay JS API version passed to the ApplePaySession constructor. Must be at least 4.",
        },
    },
};

export default meta;

type Story = StoryObj<ApplePayStoryArgs>;

export const Default: Story = {
    render: (args) => <ApplePayStoryWrapper {...args} />,
    args: {
        createOrder,
        paymentRequest: {
            countryCode: "US",
            currencyCode: "USD",
            requiredBillingContactFields: [
                "name",
                "phone",
                "email",
                "postalAddress",
            ],
            requiredShippingContactFields: [],
            total: {
                label: "Demo (Card is not charged)",
                amount: "20.00",
                type: "final",
            },
        },
        applePaySessionVersion: 4,
        buttonstyle: "black",
        type: "buy",
        locale: "en",
        disabled: false,
        ...applePayCallbacks,
    },
};
