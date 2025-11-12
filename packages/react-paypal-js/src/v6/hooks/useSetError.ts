import { useCallback, useState } from "react";

import type React from "react";

/**
 * Sets the `error` returned by {@link useSetError}. Also, calls {@link console.error} with the given {@link Error}.
 */
type TypeSetError = (error: Error) => void;

/**
 * Centralized hook for handling {@link Error}s in a consistent manner.
 */
export function useSetError(): [Error | null, TypeSetError] {
    const [error, setErrorInternal] = useState<Error | null>(null);

    const setError = useCallback((newError) => {
        setErrorInternal(newError);

        if (newError instanceof Error) {
            console.error(newError);
        }
    }, []);

    return [error, setError];
}
