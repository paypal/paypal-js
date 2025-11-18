import { useCallback, useState } from "react";

/**
 * Sets the `error` returned by {@link useError}. Also, calls `console.error` with the given {@link Error}.
 */
type TypeSetError = (error: unknown) => void;

/**
 * Centralized hook for handling {@link Error}s in a consistent manner.
 *
 * @param {Boolean} noConsoleErrors - set to `true` to prevent `setError` calls from logging to `console.error`.
 */
export function useError(
    noConsoleErrors = false,
): [Error | null, TypeSetError] {
    const [error, setErrorInternal] = useState<Error | null>(null);

    const setError = useCallback(
        (newError) => {
            setErrorInternal(newError);

            if (!noConsoleErrors) {
                console.error(newError);
            }
        },
        [noConsoleErrors],
    );

    return [error, setError];
}
