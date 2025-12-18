import { useCallback, useState, useRef } from "react";

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
    const noConsoleErrorsRef = useRef(noConsoleErrors);
    noConsoleErrorsRef.current = noConsoleErrors;

    const setError = useCallback(
        (newError) => {
            // Don't trigger a re-render if the error is the same
            if (
                newError?.message === error?.message &&
                error?.name === newError?.name
            ) {
                return;
            } else if (newError === error) {
                return;
            }
            setErrorInternal(newError);

            if (!noConsoleErrorsRef.current && newError) {
                console.error(newError);
            }
        },
        [error],
    );

    return [error, setError];
}
