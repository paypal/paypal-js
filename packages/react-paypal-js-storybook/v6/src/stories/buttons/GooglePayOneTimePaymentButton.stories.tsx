import type { Meta, StoryObj } from "@storybook/react";

import {
  GooglePayOneTimePaymentButton,
  useEligibleMethods,
} from "@paypal/react-paypal-js/sdk-v6";
import type {
  UseGooglePayOneTimePaymentSessionProps,
  GooglePayApprovePaymentResponse,
  GooglePayTransactionInfo,
} from "@paypal/react-paypal-js/sdk-v6";
import {
  createOrder,
  googlePayCallbacks,
  googlePayButtonTypeArgType,
  googlePayButtonColorArgType,
  googlePayButtonSizeModeArgType,
  disabledArgType,
} from "../../shared/utils";
import { V6DocPageStructure } from "../../components";
import { getGooglePayOneTimePaymentButtonCode } from "../../shared/code";

type GooglePayStoryArgs = {
  transactionInfo: GooglePayTransactionInfo;
  createOrder: () => Promise<{ orderId: string }>;
  onApprove: (data: GooglePayApprovePaymentResponse) => void | Promise<void>;
  onCancel?: () => void;
  onError?: (error: Error) => void;
  environment?: UseGooglePayOneTimePaymentSessionProps["environment"];
  buttonType?:
    | "book"
    | "buy"
    | "checkout"
    | "donate"
    | "order"
    | "pay"
    | "plain"
    | "subscribe";
  buttonColor?: "default" | "black" | "white";
  buttonSizeMode?: "static" | "fill";
  buttonLocale?: string;
  disabled?: boolean;
};

function GooglePayStoryWrapper(args: GooglePayStoryArgs) {
  const {
    eligiblePaymentMethods,
    isLoading: isEligibilityLoading,
    error: eligibilityError,
  } = useEligibleMethods({
    payload: { currencyCode: "USD" },
  });

  if (isEligibilityLoading) {
    return <div>Checking Google Pay eligibility...</div>;
  }

  if (eligibilityError) {
    return (
      <div style={{ color: "#c53030" }}>
        Failed to check eligibility: {eligibilityError.message}
      </div>
    );
  }

  const isEligible = eligiblePaymentMethods?.isEligible("googlepay");
  const googlePayConfig =
    eligiblePaymentMethods?.getDetails("googlepay")?.config;

  if (!isEligible || !googlePayConfig) {
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
        Google Pay is not eligible for this merchant/environment.
      </div>
    );
  }

  const {
    buttonType,
    buttonColor,
    buttonSizeMode,
    buttonLocale,
    disabled,
    ...hookProps
  } = args;

  return (
    <GooglePayOneTimePaymentButton
      googlePayConfig={googlePayConfig}
      buttonType={buttonType}
      buttonColor={buttonColor}
      buttonSizeMode={buttonSizeMode}
      buttonLocale={buttonLocale}
      disabled={disabled}
      {...hookProps}
    />
  );
}

const meta: Meta<GooglePayStoryArgs> = {
  title: "V6/Buttons/GooglePayOneTimePaymentButton",
  tags: ["autodocs"],
  parameters: {
    controls: { expanded: true },
    docs: {
      description: {
        component: `Google Pay one-time payment button powered by the PayPal SDK.

This component renders Google's native payment button via \`PaymentsClient.createButton()\` and manages the full Google Pay payment flow — including eligibility checking, payment authorization, order confirmation, and 3DS handling — via the PayPal SDK.

**Requirements:**
- Chrome browser (desktop or Android) — also works in Firefox, Edge, and Safari
- Google Pay JS SDK loaded via \`<script async src="https://pay.google.com/gp/p/js/pay.js"></script>\`
- No HTTPS required for sandbox/TEST (required for production)
- No domain registration required (unlike Apple Pay)

**Merchant responsibilities (before rendering this component):**
1. Call \`useEligibleMethods()\` to fetch eligibility and obtain \`googlePayConfig\` from \`getDetails("googlepay").config\`.
2. Pass \`googlePayConfig\` explicitly to the component — this is a required prop.
3. Provide \`transactionInfo\` with the transaction amount, currency, and country code.

**Key differences from other PayPal buttons:**
- No \`presentationMode\` — Google controls the native payment sheet
- No eager order creation (\`orderId\` prop) — orders are always created lazily during payment authorization
- \`googlePayConfig\` is required and must come from \`useEligibleMethods()\`
- \`onApprove\` receives \`GooglePayApprovePaymentResponse\` — use \`data.id\` to capture the order
- The button is injected asynchronously by Google's SDK, so there may be a brief render delay

It relies on the \`<PayPalProvider />\` parent component with \`components={["googlepay-payments"]}\`.

---

### Going live: domain & eligibility

Google Pay behaves differently in production than in sandbox. Most "works in sandbox, fails in production" reports trace back to domain configuration, so verify these **before** you launch:

1. **Register your checkout domain with Google.** In production, Google validates that the page rendering the button is an allowed domain. Register the **full FQDN** where checkout actually runs (e.g. \`shop.example.com\`) in the Google Pay Business Console — it matches the exact host, not just the apex \`example.com\`.

2. **Tell PayPal your checkout origin.** How you do this depends on where eligibility runs:
   - **Server-side** (\`fetchEligibleMethods\`, available as of \`@paypal/react-paypal-js\` 10.3.0): pass \`merchant_info.merchant_origin\` — the FQDN of your checkout page — in the payload. There is no browser origin on the server, so you must supply it.
   - **Client-side** (\`useEligibleMethods\`): the SDK resolves the origin automatically from the browser (\`window.location.origin\`, or your client token's domain claim). You don't — and can't — set it. PayPal uses this origin when preparing the signed authorization Google requires in production.

3. **⚠️ Sandbox does not enforce domain validation.** A missing or mismatched domain/origin can pass in sandbox/TEST and still fail in production. A green sandbox run is **not** proof — always verify the production configuration in production.

4. **Eligibility is device- and browser-sensitive.** Google Pay eligibility depends on the buyer's device and browser. \`useEligibleMethods\` derives that context from the request, so test on the **actual target device/browser** — don't assume a desktop result applies to mobile.
`,
      },
      page: () => (
        <V6DocPageStructure code={getGooglePayOneTimePaymentButtonCode()} />
      ),
    },
  },
  argTypes: {
    buttonType: googlePayButtonTypeArgType,
    buttonColor: googlePayButtonColorArgType,
    buttonSizeMode: googlePayButtonSizeModeArgType,
    buttonLocale: {
      control: { type: "text" },
      description: "Locale for the Google Pay button (e.g., 'en', 'fr', 'ja')",
    },
    disabled: disabledArgType,
    environment: {
      control: { type: "select" },
      options: ["TEST", "PRODUCTION"],
      description: 'Google Pay environment. Use "TEST" for sandbox testing.',
    },
    createOrder: {
      description:
        "Function that creates an order and returns `{ orderId }`. Called during payment authorization after the buyer approves.",
      table: { category: "Events" },
    },
    onApprove: {
      description:
        "Called after the payment is confirmed with PayPal. Receives `GooglePayApprovePaymentResponse` — use `data.id` to capture the order.",
      table: { category: "Events" },
    },
    onCancel: {
      description:
        "Called when the buyer dismisses the Google Pay payment sheet.",
      table: { category: "Events" },
    },
    onError: {
      description:
        "Called when an error occurs during the Google Pay flow (e.g., configuration error, network failure).",
      table: { category: "Events" },
    },
  },
};

export default meta;

type Story = StoryObj<GooglePayStoryArgs>;

export const Default: Story = {
  render: (args) => <GooglePayStoryWrapper {...args} />,
  args: {
    createOrder,
    transactionInfo: {
      countryCode: "US",
      currencyCode: "USD",
      totalPriceStatus: "FINAL",
      totalPrice: "20.00",
      totalPriceLabel: "Total",
    },
    environment: "TEST",
    buttonType: "pay",
    buttonColor: "default",
    buttonSizeMode: "static",
    disabled: false,
    ...googlePayCallbacks,
  },
};
