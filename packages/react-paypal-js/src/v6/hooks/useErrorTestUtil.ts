import { useError } from "./useError";

// Any module importing this test helper will spy on useError and prevent it from calling console.error. Note,
// this module must be imported in a test file *BEFORE* other imports that use the useError hook. Otherwise,
// the module mock will not happen soon enough.
jest.mock("./useError", () => ({
    // bind function calls to use the argument that ignores calls to console.error
    useError: jest.fn(
        jest.requireActual("./useError").useError.bind(null, true),
    ),
}));

/**
 * Expects the given {@link Error} to be returned by the last call to the hook.
 */
export const expectSetError = (error: Error | null): void => {
    const { results } = (useError as jest.Mock).mock;
    expect(results[results.length - 1].value[0]).toBe(error);
};
