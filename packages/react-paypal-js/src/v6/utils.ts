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
