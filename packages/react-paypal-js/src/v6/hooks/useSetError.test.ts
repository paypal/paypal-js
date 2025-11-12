import { act, renderHook } from "@testing-library/react-hooks";

import { useSetError } from "./useSetError";

describe("useSetError", () => {
    beforeEach(() => {
        jest.restoreAllMocks();
    });

    it("should return and console.log the error", () => {
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
});
