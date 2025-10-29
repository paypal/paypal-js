## PayPal JS SDK v6 Reference

Welcome to the PayPal JS SDK reference documentation. This documentation provides comprehensive TypeScript type definitions and detailed API information for PayPal's JavaScript SDK v6.

## Importing and Using v6 Types

**paypal-js** includes comprehensive TypeScript type definitions to help you build type-safe integrations. Here's how to import and use the v6 types in your TypeScript projects.

### Installation

Install **paypal-js** as a dependency:

```bash
npm install @paypal/paypal-js --save-dev
```

### Basic Example

A basic example showing data-typing for PayPal One Time Payment:

```typescript
import type {
    PayPalV6Namespace,
    OnApproveDataOneTimePayments,
    OnShippingAddressChangeData,
} from "@paypal/paypal-js/sdk-v6";

declare global {
    interface Window {
        paypal: PayPalV6Namespace;
    }
}

const sdkInstance = await window.paypal.createInstance({
    clientToken: "INSERT_YOUR_CLIENT_TOKEN_HERE",
    components: ["paypal-payments", "venmo-payments"],
});

function onApproveCallback(data: OnApproveDataOneTimePayments) {
    /* ... */
}
function onShippingAddressChangeCallback(data: OnShippingAddressChangeData) {
    /* ... */
}

const paypalCheckout = sdkInstance.createPayPalOneTimePaymentSession({
    onApprove: onApproveCallback,
    onShippingAddressChange: onShippingAddressChangeCallback,
});
```

### Key Features

-   **Dynamically Typed SDK Instance**: The return type of `createInstance()` changes based on which components are specified in the components array
-   **Type Safety**: Full TypeScript support with proper type checking for all SDK methods and callbacks
-   **Component-Based Types**: Different components provide access to different payment methods and functionality
-   **Comprehensive Callbacks**: Strongly typed callback functions for handling payment events
