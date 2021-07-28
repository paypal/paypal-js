import type { PayPalNamespace } from "@paypal/paypal-js";

export const DEFAULT_PAYPAL_NAMESPACE = "paypal";

export function getPayPalWindowNamespace(
    namespace: string = DEFAULT_PAYPAL_NAMESPACE
): PayPalNamespace {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (window as any)[namespace];
}
/**
 * Creates a numeric hash based on the string input.
 */
export function hashStr(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash += str[i].charCodeAt(0) * Math.pow((i % 10) + 1, 5);
    }
    return Math.floor(Math.pow(Math.sqrt(hash), 5));
}
