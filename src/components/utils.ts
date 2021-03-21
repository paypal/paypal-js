import type { PayPalNamespace } from "@paypal/paypal-js";

export const DEFAULT_PAYPAL_NAMESPACE = "paypal";

export function getPayPalWindowNamespace(
    namespace: string = DEFAULT_PAYPAL_NAMESPACE
): PayPalNamespace {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (window as any)[namespace];
}
