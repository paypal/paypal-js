import type { PayPalNamespace } from "@paypal/paypal-js";

export const DEFAULT_PAYPAL_NAMESPACE = "paypal";

export function getPayPalWindowNamespace(
    namespace: string = DEFAULT_PAYPAL_NAMESPACE
): PayPalNamespace {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (window as any)[namespace];
}

/**
 * Creates a string hash code based on the string argument
 *
 * @param str the source input string to hash
 * @returns string hash code
 */
export function hashStr(str: string): string {
    let hash = "";

    for (let i = 0; i < str.length; i++) {
        let total = str[i].charCodeAt(0) * i;

        if (str[i + 1]) {
            total += str[i + 1].charCodeAt(0) * (i - 1);
        }

        hash += String.fromCharCode(97 + (Math.abs(total) % 26));
    }

    return hash;
}
