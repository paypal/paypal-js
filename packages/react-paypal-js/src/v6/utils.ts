import { useRef } from "react";
import { dequal } from "dequal";

export function isServer(): boolean {
    return typeof window === "undefined" && typeof document === "undefined";
}

/**
 * Custom hook that memoizes a value based on deep equality comparison.
 * Returns a stable reference when the deep value hasn't changed.
 *
 * This allows developers to pass inline objects without causing unnecessary re-renders.
 *
 * @param value - The value to memoize
 * @returns A stable reference to the value
 *
 * @example
 * const memoizedOptions = useDeepCompareMemoize({
 *   clientToken: token,
 *   components: ["paypal-payments"]
 * });
 */
export function useDeepCompareMemoize<T>(value: T): T {
    const ref = useRef<T>(value);

    if (!dequal(ref.current, value)) {
        ref.current = value;
    }

    return ref.current;
}

export function cleanupComponentScripts(): void {
    const paypalScripts = document.querySelectorAll<HTMLScriptElement>(
        'script[src*="paypal.com/web-sdk/v6"]',
    );

    paypalScripts.forEach((script) => {
        // Only remove component scripts
        if (!script.src.includes("/v6/core")) {
            script.remove();
        }
    });
}
