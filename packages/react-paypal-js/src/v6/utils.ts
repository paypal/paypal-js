import { useRef } from "react";

import type { Components } from "./types";

export function isServer(): boolean {
    return typeof window === "undefined" && typeof document === "undefined";
}

/**
 * Performs a shallow equality check on two components arrays used by PayPalProvider.
 *
 * This function is specifically designed to compare the `components` prop arrays passed to
 * PayPalProvider.
 *
 * This optimization prevents unnecessary re-initialization of the PayPal SDK when the components
 * array reference changes but the actual component names remain the same. This is particularly
 * important because re-initializing the SDK is an expensive operation that involves loading scripts
 * and setting up PayPal integrations.
 *
 * @param arr1 - First components array to compare
 * @param arr2 - Second components array to compare
 * @returns `true` if both arrays are null/undefined, or if they contain the same components in the same order
 *
 * @example
 * // Returns true - both arrays have the same components in the same order
 * isEqualComponentsArray(
 *   ["paypal-payments", "venmo-payments"],
 *   ["paypal-payments", "venmo-payments"]
 * );
 *
 * @example
 * // Returns false - different order
 * isEqualComponentsArray(
 *   ["paypal-payments", "venmo-payments"],
 *   ["venmo-payments", "paypal-payments"]
 * );
 *
 * @example
 * // Returns true - both are null
 * isEqualComponentsArray(null, null);
 */
function isEqualComponentsArray(
    arr1: readonly Components[] | null | undefined,
    arr2: readonly Components[] | null | undefined,
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
 * Custom hook that memoizes a components array based on deep equality comparison.
 * Returns a stable reference when the deep value hasn't changed.
 *
 * This allows developers to pass inline component arrays without causing unnecessary re-renders.
 *
 * @param value - The components array to memoize
 * @returns A stable reference to the components array
 *
 * @example
 * const memoizedComponents = useDeepCompareMemoize(["paypal-payments", "venmo-payments"]);
 */
export function useDeepCompareMemoize<
    T extends readonly Components[] | null | undefined,
>(value: T): T {
    const ref = useRef<T>(value);

    if (!isEqualComponentsArray(ref.current, value)) {
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
