import { useSetError } from "./useSetError";

// Any module importing this test helper will spy on useSetError and prevent it from calling console.error. Note,
// this module must be imported in a test file *BEFORE* other imports that use the useSetError hook. Otherwise,
// the module mock will not happen soon enough.
jest.mock("./useSetError", () => ({
    // bind function calls to use the argument that ignores calls to console.error
    useSetError: jest.fn(
        jest.requireActual("./useSetError").useSetError.bind(null, true),
    ),
}));

/**
 * Expects the given {@link Error} to be returned by the last call to the hook.
 */
export const expectSetError = (error: Error | null): void => {
    const { results } = (useSetError as jest.Mock).mock;
    expect(results[results.length - 1].value[0]).toBe(error);
};
