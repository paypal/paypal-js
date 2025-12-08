import { act, renderHook } from "@testing-library/react-hooks";

import { useError } from "./useError";

describe("useError", () => {
    beforeEach(() => {
        jest.restoreAllMocks();
    });

    test("should return and console.log the error", () => {
        const mockError = new Error("test error");

        const mockConsoleError = jest.fn();
        jest.spyOn(console, "error").mockImplementation(mockConsoleError);

        const { result } = renderHook(() => useError());

        act(() => {
            result.current[1](mockError);
        });

        expect(mockConsoleError).toHaveBeenCalledTimes(1);
        expect(mockConsoleError).toHaveBeenCalledWith(mockError);
        expect(result.current[0]).toBe(mockError);
    });

    test("should not call console.error if noConsoleErrors is true", () => {
        const mockError = new Error("test error");

        const mockConsoleError = jest.fn();
        jest.spyOn(console, "error").mockImplementation(mockConsoleError);

        const { result } = renderHook(() => useError(true));

        act(() => {
            result.current[1](mockError);
        });

        expect(mockConsoleError).not.toHaveBeenCalled();
        expect(result.current[0]).toBe(mockError);
    });

    test("should not call console.error if there is no error", () => {
        const mockError = null;

        const mockConsoleError = jest.fn();
        jest.spyOn(console, "error").mockImplementation(mockConsoleError);

        const { result } = renderHook(() => useError());

        act(() => {
            result.current[1](mockError);
        });

        expect(mockConsoleError).not.toHaveBeenCalled();
        expect(result.current[0]).toBe(mockError);
    });
});
