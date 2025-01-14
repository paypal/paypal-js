import { useRef } from "react";

type ProxyProps = {
    [key: PropertyKey]: any;
};

export function useProxyProps(props: unknown): ProxyProps {
    const proxyRef = useRef(
        new Proxy<ProxyProps>(
            {},
            {
                get(target: ProxyProps, prop: PropertyKey, receiver) {
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
            },
        ),
    );

    proxyRef.current = Object.assign(proxyRef.current, props);

    return proxyRef.current;
}
