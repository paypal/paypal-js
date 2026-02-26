# react-paypal-js

> React components for the [PayPal JS SDK V6](https://docs.paypal.ai/payments/methods/paypal/sdk/js/v6/paypal-checkout)

<div class="badges">
    <a href="https://github.com/paypal/paypal-js/actions/workflows/main.yml"><img src="https://img.shields.io/github/actions/workflow/status/paypal/paypal-js/main.yml?branch=main&logo=github&style=flat-square" alt="build status"></a>
    <a href="https://www.npmjs.com/package/@paypal/react-paypal-js"><img src="https://img.shields.io/npm/v/@paypal/react-paypal-js.svg?style=flat-square" alt="npm version"></a>
    <a href="https://bundlephobia.com/result?p=@paypal/react-paypal-js"><img src="https://img.shields.io/bundlephobia/minzip/@paypal/react-paypal-js.svg?style=flat-square" alt="bundle size"></a>
    <a href="https://www.npmtrends.com/@paypal/react-paypal-js"><img src="https://img.shields.io/npm/dm/@paypal/react-paypal-js.svg?style=flat-square" alt="npm downloads"></a>
    <a href="https://github.com/paypal/react-paypal-js/blob/main/LICENSE"><img src="https://img.shields.io/npm/l/@paypal/react-paypal-js.svg?style=flat-square" alt="apache license"></a>
    <a href="https://paypal.github.io/paypal-js/web-sdk-v5-react-storybook/"><img src="https://raw.githubusercontent.com/storybooks/brand/master/badge/badge-storybook.svg" alt="storybook"></a>
</div>

---

> **Using react-paypal-js version 8.x or earlier?**
>
> This documentation covers the V6 SDK integration introduced in v9.0.0. For the legacy integration using `PayPalScriptProvider`, `PayPalButtons`, `PayPalHostedFields`, and `BraintreePayPalButtons`, see [README-v8.md](./README-v8.md).

---

## Why use react-paypal-js?

### The Problem

Integrating PayPal into React applications requires careful handling of SDK script loading, payment session management, and UI rendering. Building a robust integration from scratch can lead to issues with timing, state management, and buyer experience.

### The Solution

`react-paypal-js` provides a modern, hooks-based solution that abstracts away the complexities of the PayPal V6 SDK. It enforces best practices by default to ensure buyers get the best possible user experience.

**Features**

- **Modern Hooks API** - Fine-grained control over payment sessions with `usePayPalOneTimePaymentSession`, `useVenmoOneTimePaymentSession`, and more
- **Built-in Eligibility** - Automatically check which payment methods are available with `useEligibleMethods()`
- **Web Component Buttons** - Use PayPal's optimized `<paypal-button>`, `<venmo-button>`, and `<paypal-pay-later-button>` web components
- **Flexible Loading** - Support for string token/id, Promise-based token/id, and deferred loading patterns
- **TypeScript Support** - Complete type definitions for all components and hooks
- **SSR Compatible** - Built-in hydration handling for server-side rendered applications

## Supported Payment Methods

- **PayPal** - Standard PayPal checkout
- **Venmo** - Venmo payments
- **Pay Later** - PayPal's buy now, pay later option
- **PayPal Basic Card** - Guest card payments without a PayPal account
- **PayPal Subscriptions** - Recurring billing subscriptions
- **PayPal Save** - Vault payment methods without purchase
- **PayPal Credit** - PayPal Credit one-time and save payments

## Resources

- [PayPal V6 SDK Documentation](https://docs.paypal.ai/payments/methods/paypal/sdk/js/v6/paypal-checkout)
- [React Sample Integration](https://github.com/paypal-examples/v6-web-sdk-sample-integration/tree/main/client/prebuiltPages/react/oneTimePayment) - Full working example with Node.js backend
- [Live Demo](https://v6-web-sdk-sample-integration-server.fly.dev/client/prebuiltPages/react/oneTimePayment/dist/index.html) - Try the sample integration in sandbox mode
- [PayPal Server SDK](https://www.npmjs.com/package/@paypal/paypal-server-sdk) - For backend integration
- [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/)
- [PayPal Sandbox Test Accounts](https://developer.paypal.com/dashboard/accounts)
- [PayPal Sandbox Card Testing](https://developer.paypal.com/tools/sandbox/card-testing/)

## Installation

```sh
npm install @paypal/react-paypal-js
```

## Quick Start

```tsx
import {
    PayPalProvider,
    PayPalOneTimePaymentButton,
} from "@paypal/react-paypal-js/sdk-v6";

function App() {
    return (
        <PayPalProvider
            clientToken="your-client-token"
            components={["paypal-payments"]}
            pageType="checkout"
        >
            <CheckoutPage />
        </PayPalProvider>
    );
}

function CheckoutPage() {
    return (
        <PayPalOneTimePaymentButton
            createOrder={async () => {
                const response = await fetch("/api/create-order", {
                    method: "POST",
                });
                const { orderId } = await response.json();
                return { orderId };
            }}
            onApprove={async ({ orderId }: OnApproveDataOneTimePayments) => {
                await fetch(`/api/capture-order/${orderId}`, {
                    method: "POST",
                });
                console.log("Payment captured!");
            }}
        />
    );
}
```

## PayPalProvider

The `PayPalProvider` component is the entry point for the V6 SDK. It handles loading the PayPal SDK, creating an instance, and running eligibility checks.

### Props

| Prop                      | Type                                 | Required | Description                                                                                                  |
| ------------------------- | ------------------------------------ | -------- | ------------------------------------------------------------------------------------------------------------ |
| `clientToken`             | `string \| Promise<string>`          | \*       | Client token from your server. Mutually exclusive with `clientId`.                                           |
| `clientId`                | `string \| Promise<string>`          | \*       | Client ID from your PayPal app. Mutually exclusive with `clientToken`.                                       |
| `components`              | `Components[]`                       | No       | SDK components to load. Defaults to `["paypal-payments"]`.                                                   |
| `pageType`                | `string`                             | No       | Type of page: `"checkout"`, `"product-details"`, `"cart"`, `"product-listing"`, etc.                         |
| `locale`                  | `string`                             | No       | Locale for the SDK (e.g., `"en_US"`).                                                                        |
| `environment`             | `"sandbox" \| "production"`          | No       | SDK environment.                                                                                             |
| `merchantId`              | `string \| string[]`                 | No       | PayPal merchant ID(s).                                                                                       |
| `clientMetadataId`        | `string`                             | No       | Client metadata ID for tracking.                                                                             |
| `partnerAttributionId`    | `string`                             | No       | Partner attribution ID (BN code).                                                                            |
| `shopperSessionId`        | `string`                             | No       | Shopper session ID for tracking.                                                                             |
| `testBuyerCountry`        | `string`                             | No       | Test buyer country code (sandbox only).                                                                      |
| `debug`                   | `boolean`                            | No       | Enable debug mode.                                                                                           |
| `dataNamespace`           | `string`                             | No       | Custom namespace for the SDK script data attribute.                                                          |
| `eligibleMethodsResponse` | `FindEligiblePaymentMethodsResponse` | No       | Server-fetched eligibility response for SDK hydration (see [Server-Side Rendering](#server-side-rendering)). |

> \* Either `clientToken` or `clientId` is required, but not both. They are mutually exclusive.

### Available Components

The `components` prop accepts an array of the following values:

- `"paypal-payments"` - PayPal and Pay Later buttons
- `"venmo-payments"` - Venmo button
- `"paypal-guest-payments"` - Guest checkout (card payments)
- `"paypal-subscriptions"` - Subscription payments

### With Promise-based Client ID

```tsx
function App() {
    // Memoize to prevent re-fetching on each render
    const clientIdPromise = useMemo(() => fetchClientId(), []);

    return (
        <PayPalProvider
            clientId={clientIdPromise}
            components={["paypal-payments"]}
            pageType="checkout"
        >
            <CheckoutPage />
        </PayPalProvider>
    );
}
```

### With Promise-based Token

```tsx
function App() {
    // Memoize to prevent re-fetching on each render
    const tokenPromise = useMemo(() => fetchClientToken(), []);

    return (
        <PayPalProvider
            clientToken={tokenPromise}
            components={["paypal-payments"]}
            pageType="checkout"
        >
            <CheckoutPage />
        </PayPalProvider>
    );
}
```

### Deferred Loading (works for either Client token or ID)

```tsx
function App() {
    const [clientToken, setClientToken] = useState<string>();

    useEffect(() => {
        fetchClientToken().then(setClientToken);
    }, []);

    return (
        <PayPalProvider
            clientToken={clientToken}
            components={["paypal-payments"]}
            pageType="checkout"
        >
            <CheckoutPage />
        </PayPalProvider>
    );
}
```

### Tracking Loading State

Use the `usePayPal` hook to access the SDK loading status:

```tsx
import {
    usePayPal,
    INSTANCE_LOADING_STATE,
} from "@paypal/react-paypal-js/sdk-v6";

function CheckoutPage() {
    const { loadingStatus, error } = usePayPal();

    if (loadingStatus === INSTANCE_LOADING_STATE.PENDING) {
        return <div className="spinner">Loading PayPal...</div>;
    }

    if (loadingStatus === INSTANCE_LOADING_STATE.REJECTED) {
        return (
            <div className="error">
                Failed to load PayPal SDK: {error?.message}
            </div>
        );
    }

    return <PayPalOneTimePaymentButton orderId="ORDER-123" />;
}
```

## Button Components

### PayPalOneTimePaymentButton

Renders a PayPal button for one-time payments.

```tsx
import { PayPalOneTimePaymentButton } from "@paypal/react-paypal-js/sdk-v6";

<PayPalOneTimePaymentButton
    createOrder={async () => {
        const response = await fetch("/api/create-order", { method: "POST" });
        const { orderId } = await response.json();
        return { orderId };
    }}
    onApprove={async ({ orderId }: OnApproveDataOneTimePayments) => {
        await fetch(`/api/capture/${orderId}`, { method: "POST" });
        console.log("Payment approved!");
    }}
    onCancel={(data: OnCancelDataOneTimePayments) =>
        console.log("Payment cancelled")
    }
    onError={(data: OnErrorData) => console.error("Payment error:", data)}
    onComplete={(data: OnCompleteData) => console.log("Payment Flow Completed")}
/>;
```

**Props:**

| Prop               | Type                                                         | Description                                            |
| ------------------ | ------------------------------------------------------------ | ------------------------------------------------------ |
| `orderId`          | `string`                                                     | Static order ID (alternative to `createOrder`)         |
| `createOrder`      | `() => Promise<{ orderId: string }>`                         | Async function to create an order                      |
| `presentationMode` | `"auto" \| "popup" \| "modal" \| "redirect"`                 | How to present the payment session (default: `"auto"`) |
| `onApprove`        | `(data) => void`                                             | Called when payment is approved                        |
| `onCancel`         | `() => void`                                                 | Called when buyer cancels                              |
| `onError`          | `(error) => void`                                            | Called on error                                        |
| `onComplete`       | `(data) => void`                                             | Called when payment session completes                  |
| `type`             | `"pay" \| "checkout" \| "buynow" \| "donate" \| "subscribe"` | Button label type                                      |
| `disabled`         | `boolean`                                                    | Disable the button                                     |

### VenmoOneTimePaymentButton

Renders a Venmo button for one-time payments. Requires `"venmo-payments"` in the provider's `components` array.

```tsx
import { VenmoOneTimePaymentButton } from "@paypal/react-paypal-js/sdk-v6";

<PayPalProvider
    clientToken={token}
    components={["paypal-payments", "venmo-payments"]}
    pageType="checkout"
>
    <VenmoOneTimePaymentButton
        createOrder={async () => {
            const { orderId } = await createOrder();
            return { orderId };
        }}
        onApprove={(data: OnApproveDataOneTimePayments) =>
            console.log("Venmo payment approved!", data)
        }
        onCancel={(data: OnCancelDataOneTimePayments) =>
            console.log("Venmo payment cancelled", data)
        }
        onError={(data: OnErrorData) =>
            console.error("Venmo payment error:", data)
        }
        onComplete={(data: OnCompleteData) =>
            console.log("Venmo payment flow completed", data)
        }
    />
</PayPalProvider>;
```

### PayLaterOneTimePaymentButton

Renders a Pay Later button for financing options. Country code and product code are automatically populated from eligibility data.

```tsx
import { PayLaterOneTimePaymentButton } from "@paypal/react-paypal-js/sdk-v6";

<PayLaterOneTimePaymentButton
    createOrder={async () => {
        const { orderId } = await createOrder();
        return { orderId };
    }}
    onApprove={(data: OnApproveDataOneTimePayments) =>
        console.log("Pay Later approved!", data)
    }
    onCancel={(data: OnCancelDataOneTimePayments) =>
        console.log("Pay Later cancelled", data)
    }
    onError={(data: OnErrorData) => console.error("Pay Later error:", data)}
    onComplete={(data: OnCompleteData) =>
        console.log("Pay Later flow completed", data)
    }
/>;
```

### PayPalGuestPaymentButton

Renders a guest checkout button for card payments without a PayPal account (Branded Card/Debit Card checkout). Requires `"paypal-guest-payments"` in the provider's `components` array.

```tsx
import { PayPalGuestPaymentButton } from "@paypal/react-paypal-js/sdk-v6";

<PayPalProvider
    clientToken={token}
    components={["paypal-payments", "paypal-guest-payments"]}
    pageType="checkout"
>
    <PayPalGuestPaymentButton
        createOrder={async () => {
            const { orderId } = await createOrder();
            return { orderId };
        }}
        onApprove={(data: OnApproveDataOneTimePayments) =>
            console.log("Guest payment approved!", data)
        }
        onCancel={(data: OnCancelDataOneTimePayments) =>
            console.log("Guest payment cancelled", data)
        }
        onError={(data: OnErrorData) =>
            console.error("Guest payment error:", data)
        }
        onComplete={(data: OnCompleteData) =>
            console.log("Guest payment flow completed", data)
        }
    />
</PayPalProvider>;
```

### PayPalSavePaymentButton

Renders a button for vaulting a payment method without making a purchase.

```tsx
import { PayPalSavePaymentButton } from "@paypal/react-paypal-js/sdk-v6";

<PayPalSavePaymentButton
    createVaultToken={async () => {
        const response = await fetch("/api/create-vault-token", {
            method: "POST",
        });
        const { vaultSetupToken } = await response.json();
        return { vaultSetupToken };
    }}
    onApprove={({ vaultSetupToken }: OnApproveDataSavePayments) => {
        console.log("Payment method saved:", vaultSetupToken);
    }}
    onCancel={(data: OnCancelDataSavePayments) =>
        console.log("Save payment cancelled", data)
    }
    onError={(data: OnErrorData) => console.error("Save payment error:", data)}
    onComplete={(data: OnCompleteData) =>
        console.log("Save payment flow completed", data)
    }
/>;
```

### PayPalSubscriptionButton

Renders a PayPal button for subscription payments. Requires `"paypal-subscriptions"` in the provider's `components` array.

```tsx
import { PayPalSubscriptionButton } from "@paypal/react-paypal-js/sdk-v6";

<PayPalProvider
    clientToken={token}
    components={["paypal-subscriptions"]}
    pageType="checkout"
>
    <PayPalSubscriptionButton
        createSubscription={async () => {
            const response = await fetch("/api/create-subscription", {
                method: "POST",
            });
            const { subscriptionId } = await response.json();
            return { subscriptionId };
        }}
        onApprove={(data: OnApproveDataOneTimePayments) =>
            console.log("Subscription approved:", data)
        }
        onCancel={(data: OnCancelDataOneTimePayments) =>
            console.log("Subscription cancelled", data)
        }
        onError={(data: OnErrorData) =>
            console.error("Subscription error:", data)
        }
        onComplete={(data: OnCompleteData) =>
            console.log("Subscription flow completed", data)
        }
    />
</PayPalProvider>;
```

### PayPalCreditOneTimePaymentButton

Renders a PayPal Credit button for one-time payments. The `countryCode` is automatically populated from eligibility data.

```tsx
import { PayPalCreditOneTimePaymentButton } from "@paypal/react-paypal-js/sdk-v6";

<PayPalCreditOneTimePaymentButton
    createOrder={async () => {
        const response = await fetch("/api/create-order", { method: "POST" });
        const { orderId } = await response.json();
        return { orderId };
    }}
    onApprove={({ orderId }: OnApproveDataOneTimePayments) =>
        console.log("Credit payment approved:", orderId)
    }
    onCancel={(data: OnCancelDataOneTimePayments) =>
        console.log("Credit payment cancelled", data)
    }
    onError={(data: OnErrorData) =>
        console.error("Credit payment error:", data)
    }
    onComplete={(data: OnCompleteData) =>
        console.log("Credit payment flow completed", data)
    }
/>;
```

### PayPalCreditSavePaymentButton

Renders a PayPal Credit button for saving a credit payment method (vaulting).

```tsx
import { PayPalCreditSavePaymentButton } from "@paypal/react-paypal-js/sdk-v6";

<PayPalCreditSavePaymentButton
    createVaultToken={async () => {
        const response = await fetch("/api/create-vault-token", {
            method: "POST",
        });
        const { vaultSetupToken } = await response.json();
        return { vaultSetupToken };
    }}
    onApprove={(data: OnApproveDataSavePayments) =>
        console.log("Credit saved:", data)
    }
    onCancel={(data: OnCancelDataSavePayments) =>
        console.log("Credit save cancelled", data)
    }
    onError={(data: OnErrorData) => console.error("Credit save error:", data)}
    onComplete={(data: OnCompleteData) =>
        console.log("Credit save flow completed", data)
    }
/>;
```

## Payment Flow

1. User clicks a payment button
2. `handleClick()` starts the payment session
3. `createOrder` callback creates an order via your backend API
4. PayPal opens the checkout experience (popup/modal/redirect)
5. On approval, `onApprove` callback captures the order via the backend
6. Success/error handling displays the result to the user

## Hooks API

### usePayPal

Returns the PayPal context including the SDK instance and loading status.

```tsx
import {
    usePayPal,
    INSTANCE_LOADING_STATE,
} from "@paypal/react-paypal-js/sdk-v6";

function MyComponent() {
    const {
        sdkInstance, // The PayPal SDK instance
        eligiblePaymentMethods, // Eligible payment methods
        loadingStatus, // PENDING | RESOLVED | REJECTED
        error, // Any initialization error
        isHydrated, // SSR hydration status
    } = usePayPal();

    const isPending = loadingStatus === INSTANCE_LOADING_STATE.PENDING;
    const isReady = loadingStatus === INSTANCE_LOADING_STATE.RESOLVED;

    // ...
}
```

### useEligibleMethods

Returns eligible payment methods and loading state. Use this to conditionally render payment buttons based on eligibility. This hook also updates the `PayPalProvider` reducer with Eligibility Output from the SDK, enabling built-in eligibility features in the UI Button components.

```tsx
import { useEligibleMethods } from "@paypal/react-paypal-js/sdk-v6";

function PaymentOptions() {
    const { eligiblePaymentMethods, isLoading, error } = useEligibleMethods();

    if (isLoading) return <div>Checking eligibility...</div>;

    const isPayPalEligible = eligiblePaymentMethods?.isEligible("paypal");
    const isVenmoEligible = eligiblePaymentMethods?.isEligible("venmo");
    const isPayLaterEligible = eligiblePaymentMethods?.isEligible("paylater");

    return (
        <div>
            {isPayPalEligible && <PayPalOneTimePaymentButton {...props} />}
            {isVenmoEligible && <VenmoOneTimePaymentButton {...props} />}
            {isPayLaterEligible && <PayLaterOneTimePaymentButton {...props} />}
        </div>
    );
}
```

### usePayPalMessages

Hook for integrating PayPal messaging (Pay Later promotions).

```tsx
import { usePayPalMessages } from "@paypal/react-paypal-js/sdk-v6";

function PayLaterMessage() {
    const { error, isReady, handleFetchContent, handleCreateLearnMore } =
        usePayPalMessages({
            buyerCountry: "US",
            currencyCode: "USD",
        });

    // Use to display financing messages
}
```

### Payment Session Hooks

For advanced use cases where you need full control over the payment flow, use the session hooks directly with web components.

> **Note:** One-time payment session hooks (e.g., `usePayPalOneTimePaymentSession`) accept either a static `orderId` or a `createOrder` callback — they are mutually exclusive. Use `orderId` when you've already created the order, or `createOrder` to defer order creation until the buyer clicks. The same pattern applies to save payment hooks with `vaultSetupToken` vs `createVaultToken`.

| Hook                                   | Payment Type        |
| -------------------------------------- | ------------------- |
| `usePayPalOneTimePaymentSession`       | PayPal              |
| `useVenmoOneTimePaymentSession`        | Venmo               |
| `usePayLaterOneTimePaymentSession`     | Pay Later           |
| `usePayPalGuestPaymentSession`         | Basic Card          |
| `usePayPalSubscriptionPaymentSession`  | Subscriptions       |
| `usePayPalSavePaymentSession`          | Save Payment Method |
| `usePayPalCreditOneTimePaymentSession` | Credit (One-time)   |
| `usePayPalCreditSavePaymentSession`    | Credit (Save)       |

#### usePayPalOneTimePaymentSession

```tsx
import { usePayPalOneTimePaymentSession } from "@paypal/react-paypal-js/sdk-v6";

function CustomPayPalButton() {
    const { isPending, error, handleClick } = usePayPalOneTimePaymentSession({
        createOrder: async () => {
            const { orderId } = await createOrder();
            return { orderId };
        },
        presentationMode: "auto",
        onApprove: (data: OnApproveDataOneTimePayments) =>
            console.log("Approved:", data),
        onCancel: (data: OnCancelDataOneTimePayments) =>
            console.log("Cancelled"),
        onError: (data: OnErrorData) => console.error(data),
        onComplete: (data: OnCompleteData) =>
            console.log("Payment session complete", data),
    });

    return (
        <paypal-button
            onClick={() => handleClick()}
            type="pay"
            disabled={isPending || error !== null}
        />
    );
}
```

#### useVenmoOneTimePaymentSession

```tsx
import { useVenmoOneTimePaymentSession } from "@paypal/react-paypal-js/sdk-v6";

function CustomVenmoButton() {
    const { handleClick } = useVenmoOneTimePaymentSession({
        createOrder: async () => {
            const { orderId } = await createOrder();
            return { orderId };
        },
        onApprove: (data: OnApproveDataOneTimePayments) =>
            console.log("Approved:", data),
        onCancel: (data: OnCancelDataOneTimePayments) =>
            console.log("Cancelled", data),
        onError: (data: OnErrorData) => console.error("Error:", data),
        onComplete: (data: OnCompleteData) =>
            console.log("Payment session complete", data),
    });

    return <venmo-button onClick={() => handleClick()} />;
}
```

#### usePayLaterOneTimePaymentSession

```tsx
import { usePayLaterOneTimePaymentSession } from "@paypal/react-paypal-js/sdk-v6";

function CustomPayLaterButton() {
    const { handleClick } = usePayLaterOneTimePaymentSession({
        createOrder: async () => {
            const { orderId } = await createOrder();
            return { orderId };
        },
        onApprove: (data: OnApproveDataOneTimePayments) =>
            console.log("Approved:", data),
        onCancel: (data: OnCancelDataOneTimePayments) =>
            console.log("Cancelled", data),
        onError: (data: OnErrorData) => console.error("Error:", data),
        onComplete: (data: OnCompleteData) =>
            console.log("Payment session complete", data),
    });

    return <paypal-pay-later-button onClick={() => handleClick()} />;
}
```

#### usePayPalGuestPaymentSession

```tsx
import { usePayPalGuestPaymentSession } from "@paypal/react-paypal-js/sdk-v6";

function CustomPayPalGuestButton() {
    const { handleClick, buttonRef } = usePayPalGuestPaymentSession({
        createOrder: async () => {
            const { orderId } = await createOrder();
            return { orderId };
        },
        onApprove: (data: OnApproveDataOneTimePayments) =>
            console.log("Approved:", data),
        onCancel: (data: OnCancelDataOneTimePayments) =>
            console.log("Cancelled", data),
        onError: (data: OnErrorData) => console.error("Error:", data),
        onComplete: (data: OnCompleteData) =>
            console.log("Payment session complete", data),
    });

    return (
        <paypal-basic-card-container>
            <paypal-basic-card-button
                ref={buttonRef}
                onClick={() => handleClick()}
            />
        </paypal-basic-card-container>
    );
}
```

#### usePayPalSavePaymentSession

```tsx
import { usePayPalSavePaymentSession } from "@paypal/react-paypal-js/sdk-v6";

function CustomPayPalSaveButton() {
    const { handleClick } = usePayPalSavePaymentSession({
        createVaultToken: async () => {
            const { vaultSetupToken } = await createVaultToken();
            return { vaultSetupToken };
        },
        presentationMode: "popup",
        onApprove: (data: OnApproveDataSavePayments) =>
            console.log("Saved:", data),
        onCancel: (data: OnCancelDataSavePayments) =>
            console.log("Cancelled", data),
        onError: (data: OnErrorData) => console.error("Error:", data),
        onComplete: (data: OnCompleteData) =>
            console.log("Payment session complete", data),
    });

    return <paypal-button onClick={() => handleClick()} type="pay" />;
}
```

#### usePayPalSubscriptionPaymentSession

```tsx
import { usePayPalSubscriptionPaymentSession } from "@paypal/react-paypal-js/sdk-v6";

function CustomPayPalSubscriptionButton() {
    const { handleClick } = usePayPalSubscriptionPaymentSession({
        createSubscription: async () => {
            const response = await fetch("/api/create-subscription", {
                method: "POST",
            });
            const { subscriptionId } = await response.json();
            return { subscriptionId };
        },
        onApprove: (data: OnApproveDataOneTimePayments) =>
            console.log("Subscription approved:", data),
        onCancel: (data: OnCancelDataOneTimePayments) =>
            console.log("Cancelled", data),
        onError: (data: OnErrorData) => console.error("Error:", data),
        onComplete: (data: OnCompleteData) =>
            console.log("Payment session complete", data),
    });

    return <paypal-button onClick={() => handleClick()} type="subscribe" />;
}
```

#### usePayPalCreditOneTimePaymentSession

For PayPal Credit one-time payments.

```tsx
import { usePayPalCreditOneTimePaymentSession } from "@paypal/react-paypal-js/sdk-v6";

function CustomPayPalCreditButton() {
    const { handleClick } = usePayPalCreditOneTimePaymentSession({
        createOrder: async () => {
            const { orderId } = await createOrder();
            return { orderId };
        },
        onApprove: (data: OnApproveDataOneTimePayments) =>
            console.log("Credit approved:", data),
        onCancel: (data: OnCancelDataOneTimePayments) =>
            console.log("Cancelled", data),
        onError: (data: OnErrorData) => console.error("Error:", data),
        onComplete: (data: OnCompleteData) =>
            console.log("Payment session complete", data),
    });

    return <paypal-credit-button onClick={() => handleClick()} />;
}
```

#### usePayPalCreditSavePaymentSession

For saving PayPal Credit as a payment method.

```tsx
import { usePayPalCreditSavePaymentSession } from "@paypal/react-paypal-js/sdk-v6";

function CustomPayPalCreditSaveButton() {
    const { handleClick } = usePayPalCreditSavePaymentSession({
        createVaultToken: async () => {
            const { vaultSetupToken } = await createVaultSetupToken();
            return { vaultSetupToken };
        },
        onApprove: (data: OnApproveDataSavePayments) =>
            console.log("Credit approved:", data),
        onCancel: (data: OnCancelDataSavePayments) =>
            console.log("Cancelled", data),
        onError: (data: OnErrorData) => console.error("Error:", data),
        onComplete: (data: OnCompleteData) =>
            console.log("Payment session complete", data),
    });

    return <paypal-credit-button onClick={() => handleClick()} />;
}
```

## Web Components

The V6 SDK uses web components for rendering buttons. These are automatically typed when you import from `@paypal/react-paypal-js/sdk-v6`.

### Available Web Components

| Component                       | Description                |
| ------------------------------- | -------------------------- |
| `<paypal-button>`               | PayPal payment button      |
| `<venmo-button>`                | Venmo payment button       |
| `<paypal-pay-later-button>`     | Pay Later button           |
| `<paypal-basic-card-container>` | Guest checkout container   |
| `<paypal-basic-card-button>`    | Guest checkout button      |
| `<paypal-credit-button>`        | PayPal Credit button       |
| `<paypal-message>`              | PayPal messaging component |

### Button Types

The `type` prop controls the button label:

- `"pay"` - "Pay with PayPal" (default)
- `"checkout"` - "Checkout with PayPal"
- `"buynow"` - "Buy Now"
- `"donate"` - "Donate"
- `"subscribe"` - "Subscribe"

```tsx
<paypal-button type="checkout" onClick={handleClick} />
```

## Server-Side Rendering

The `useFetchEligibleMethods` function is available from the server export path for pre-fetching eligibility data on the server. Pass the response to `PayPalProvider` via the `eligibleMethodsResponse` prop to avoid a client-side eligibility fetch.

```tsx
// app/checkout/page.tsx (Next.js server component)
import { useFetchEligibleMethods } from "@paypal/react-paypal-js/sdk-v6/server";
import { PayPalProvider } from "@paypal/react-paypal-js/sdk-v6";

export default async function CheckoutPage() {
    const eligibleMethodsResponse = await useFetchEligibleMethods({
        environment: "sandbox",
        headers: {
            Authorization: `Bearer ${clientToken}`,
            "Content-Type": "application/json",
        },
        payload: {
            purchase_units: [
                { amount: { currency_code: "USD", value: "100.00" } },
            ],
        },
    });

    return (
        <PayPalProvider
            clientToken={clientToken}
            pageType="checkout"
            eligibleMethodsResponse={eligibleMethodsResponse}
        >
            <CheckoutForm />
        </PayPalProvider>
    );
}
```

## Migration from v8.x (Legacy SDK)

The v9.0.0 release introduces the V6 SDK with a new API. Here are the key differences:

| v8.x (Legacy)                   | v9.0.0 (V6 SDK)                                      |
| ------------------------------- | ---------------------------------------------------- |
| `PayPalScriptProvider`          | `PayPalProvider`                                     |
| `PayPalButtons`                 | `PayPalOneTimePaymentButton` or hooks                |
| `options={{ clientId }}`        | `clientId={clientId}` or `clientToken={clientToken}` |
| `createOrder` returns `orderId` | `createOrder` returns `{ orderId }`                  |
| `@paypal/react-paypal-js`       | `@paypal/react-paypal-js/sdk-v6`                     |

### Before (v8.x)

```tsx
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

<PayPalScriptProvider options={{ clientId: "test" }}>
    <PayPalButtons
        createOrder={() => {
            return fetch("/api/orders", { method: "POST" })
                .then((res) => res.json())
                .then((order) => order.id);
        }}
        onApprove={(data) => {
            return fetch(`/api/orders/${data.orderID}/capture`, {
                method: "POST",
            });
        }}
    />
</PayPalScriptProvider>;
```

### After (v9.0.0)

```tsx
import {
    PayPalProvider,
    PayPalOneTimePaymentButton,
} from "@paypal/react-paypal-js/sdk-v6";

<PayPalProvider clientToken={token} pageType="checkout">
    <PayPalOneTimePaymentButton
        createOrder={async () => {
            const res = await fetch("/api/orders", { method: "POST" });
            const order = await res.json();
            return { orderId: order.id };
        }}
        onApprove={async ({ orderId }) => {
            await fetch(`/api/orders/${orderId}/capture`, { method: "POST" });
        }}
    />
</PayPalProvider>;
```

For the legacy API documentation, see [README-v8.md](./README-v8.md).

## TypeScript

This package includes full TypeScript definitions. Import types from the same path:

```tsx
import type {
    // Web component props
    ButtonProps,
    PayLaterButtonProps,
    PayPalBasicCardButtonProps,
    PayPalCreditButtonProps,

    // Session hook props
    UsePayPalOneTimePaymentSessionProps,
    UseVenmoOneTimePaymentSessionProps,
    UsePayLaterOneTimePaymentSessionProps,
    UsePayPalGuestPaymentSessionProps,
    UsePayPalSubscriptionPaymentSessionProps,
    UsePayPalSavePaymentSessionProps,
    UsePayPalCreditOneTimePaymentSessionProps,
    UsePayPalCreditSavePaymentSessionProps,

    // Button component props
    PayPalSubscriptionButtonProps,
    PayPalCreditOneTimePaymentButtonProps,
    PayPalCreditSavePaymentButtonProps,

    // Enums
    INSTANCE_LOADING_STATE,
} from "@paypal/react-paypal-js/sdk-v6";
```

### Web Component Types

The package automatically extends JSX types to include PayPal web components. No additional configuration is needed for React 17, 18, or 19.

## Browser Support

This library supports all modern browsers. See the [PayPal browser support documentation](https://developer.paypal.com/docs/business/checkout/reference/browser-support/) for the full list.
