import { act, renderHook } from "@testing-library/react-hooks";

import { useError } from "./useError";

describe("useError", () => {
    beforeEach(() => {
        jest.restoreAllMocks();
    });

    test("should not re-run if new error is the same as the previous error", () => {
        const mockError1 = new Error("test error with the same error message");
        const mockError2 = new Error("test error with the same error message");

        const mockConsoleError = jest.fn();
        jest.spyOn(console, "error").mockImplementation(mockConsoleError);

        const { result } = renderHook(() => useError());

        act(() => {
            result.current[1](mockError1);
        });

        act(() => {
            result.current[1](mockError2);
        });

        expect(mockConsoleError).toHaveBeenCalledTimes(1);
        expect(mockConsoleError).toHaveBeenCalledWith(mockError1);
        expect(result.current[0]).toBe(mockError1);
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
});
