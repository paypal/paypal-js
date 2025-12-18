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

    // TODO there's a potential pitfall here where setting the error to different
    // values in different parts of a parent component would cause an infinite
    // loop because setting the error triggers a re-render and the next time
    // we're in this hook, the error could have changed.
    //
    // TODO this hook was updated to check that the new error is the same as the
    // previous error, so that it doesn't trigger another re-render for the same
    // error.

    const setError = useCallback(
        (newError) => {
            if (newError === error) {
                return;
            }

            if (
                newError?.name === error?.name &&
                newError?.message === error?.message
            ) {
                return;
            }

            setErrorInternal(newError);

            if (!noConsoleErrors) {
                console.error(newError);
            }
        },
        [error, noConsoleErrors],
    );

    return [error, setError];
}
