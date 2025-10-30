import { useRef } from "react";

import type { Components } from "./types";

export function isServer(): boolean {
    return typeof window === "undefined" && typeof document === "undefined";
}

/**
 * Performs a shallow equality check on two arrays.
 *
 * This function compares two arrays element-by-element using strict equality (===).
 * It's primarily used to compare the `components` prop arrays passed to PayPalProvider
 * to prevent unnecessary re-initialization of the PayPal SDK.
 *
 * This optimization is important because re-initializing the SDK is an expensive operation
 * that involves loading scripts and setting up PayPal integrations.
 *
 * @param arr1 - First array to compare
 * @param arr2 - Second array to compare
 * @returns `true` if both arrays are null/undefined, or if they contain the same elements in the same order
 *
 * @example
 * // Returns true - both arrays have the same elements in the same order
 * shallowEqualArray(
 *   ["paypal-payments", "venmo-payments"],
 *   ["paypal-payments", "venmo-payments"]
 * );
 *
 * @example
 * // Returns false - different order
 * shallowEqualArray(
 *   ["paypal-payments", "venmo-payments"],
 *   ["venmo-payments", "paypal-payments"]
 * );
 *
 * @example
 * // Returns true - both are null
 * shallowEqualArray(null, null);
 */
function shallowEqualArray<T>(
    arr1: readonly T[] | null | undefined,
    arr2: readonly T[] | null | undefined,
): boolean {
    if (!arr1 && !arr2) {
        return true;
    }

    if (!arr1 || !arr2) {
        return false;
    }

    if (arr1.length !== arr2.length) {
        return false;
    }

    for (let i = 0; i < arr1.length; i++) {
        if (arr1[i] !== arr2[i]) {
            return false;
        }
    }

    return true;
}

/**
 * Custom hook that memoizes a components array based on shallow equality comparison.
 * Returns a stable reference when the array contents haven't changed.
 *
 * This allows developers to pass inline component arrays without causing unnecessary re-renders
 * when the array values are the same, even if the array reference changes.
 *
 * @param value - The components array to memoize
 * @returns A stable reference to the components array
 *
 * @example
 * const memoizedComponents = useCompareMemoize(["paypal-payments", "venmo-payments"]);
 */
export function useCompareMemoize<
    T extends readonly Components[] | null | undefined,
>(value: T): T {
    const ref = useRef<T>(value);

    if (!shallowEqualArray(ref.current, value)) {
        ref.current = value;
    }

    return ref.current;
}

export function useProxyProps<T extends Record<PropertyKey, unknown>>(
    props: T,
): T {
    const proxyRef = useRef(
        new Proxy<T>({} as T, {
            get(target: T, prop: PropertyKey, receiver) {
                /**
                 *
                 * If target[prop] is a function, return a function that accesses
                 * this function off the target object. We can mutate the target with
                 * new copies of this function without having to re-render the
                 * SDK components to pass new callbacks.
                 *
                 * */
                if (typeof target[prop] === "function") {
                    return (...args: unknown[]) =>
                        // eslint-disable-next-line @typescript-eslint/ban-types
                        (target[prop] as Function)(...args);
                }

                return Reflect.get(target, prop, receiver);
            },
        }),
    );

    proxyRef.current = Object.assign(proxyRef.current, props);

    return proxyRef.current;
}
