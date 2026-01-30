"use client";

import { useEffect, useRef } from "react";

import type React from "react";

/**
 * Return a {@link React.MutableRefObject} a stable ref that's `true` if the component is mounted, `false` otherwise.
 *
 * The return must, unfortunately be included in dependency arrays. See the issue here: [\[eslint-plugin-react-hooks\] allow configuring custom hooks as "static" #16873](https://github.com/facebook/react/issues/16873).
 */
export function useIsMountedRef(): React.MutableRefObject<boolean> {
    const isMounted = useRef(false);

    useEffect(() => {
        isMounted.current = true;

        return () => {
            isMounted.current = false;
        };
    }, []);

    return isMounted;
}
