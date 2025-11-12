import { act, renderHook } from "@testing-library/react-hooks";

import { useSetError } from "./useSetError";

describe("useSetError", () => {
    beforeEach(() => {
        jest.restoreAllMocks();
    });

    test("should return and console.log the error", () => {
        const mockError = new Error("test error");

        const mockConsoleError = jest.fn();
        jest.spyOn(console, "error").mockImplementation(mockConsoleError);

        const { result } = renderHook(() => useSetError());

        act(() => {
            result.current[1](mockError);
        });

        expect(mockConsoleError).toHaveBeenCalledTimes(1);
        expect(mockConsoleError).toHaveBeenCalledWith(mockError);
        expect(result.current[0]).toBe(mockError);
    });

    test("should not console.log the error if noConsoleErrors is true", () => {
        const mockError = new Error("test error");

        const mockConsoleError = jest.fn();
        jest.spyOn(console, "error").mockImplementation(mockConsoleError);

        const { result } = renderHook(() => useSetError(true));

        act(() => {
            result.current[1](mockError);
        });

        expect(mockConsoleError).not.toHaveBeenCalled();
        expect(result.current[0]).toBe(mockError);
    });
});
