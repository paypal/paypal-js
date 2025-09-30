import { useRef } from "react";
import deepEqual from "fast-deep-equal";

export const isServer = typeof window === "undefined";

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

    if (!deepEqual(ref.current, value)) {
        ref.current = value;
    }

    return ref.current;
}
