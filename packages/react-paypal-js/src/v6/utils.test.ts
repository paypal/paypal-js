/**
 * @jest-environment jsdom
 */
import { renderHook } from "@testing-library/react-hooks";

import {
    createPaymentSession,
    deepEqual,
    useDeepCompareMemoize,
    useCompareMemoize,
} from "./utils";

describe("createPaymentSession", () => {
    let mockSetError: jest.Mock;
    let failedSdkRef: { current: unknown };
    let mockSdkInstance: unknown;

    beforeEach(() => {
        mockSetError = jest.fn();
        failedSdkRef = { current: null };
        mockSdkInstance = { id: "test-sdk-instance" };
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("successful session creation", () => {
        test("should successfully create session when sessionCreator succeeds", () => {
            const mockSession = { start: jest.fn(), destroy: jest.fn() };
            const sessionCreator = jest.fn().mockReturnValue(mockSession);

            const result = createPaymentSession(
                sessionCreator,
                failedSdkRef,
                mockSdkInstance,
                mockSetError,
                "paypal-payments",
            );

            expect(result).toBe(mockSession);
            expect(sessionCreator).toHaveBeenCalledTimes(1);
            expect(mockSetError).not.toHaveBeenCalled();
            expect(failedSdkRef.current).toBeNull();
        });
    });

    describe("error handling with component parameter", () => {
        test("should handle session creation failure with proper error message and error preservation", () => {
            const originalError = new Error("Component missing");
            const sessionCreator = jest.fn().mockImplementation(() => {
                throw originalError;
            });

            const result = createPaymentSession(
                sessionCreator,
                failedSdkRef,
                mockSdkInstance,
                mockSetError,
                "paypal-payments",
            );

            expect(result).toBeNull();
            expect(mockSetError).toHaveBeenCalledTimes(1);

            const thrownError = mockSetError.mock.calls[0][0];
            expect(thrownError).toBeInstanceOf(Error);
            expect(thrownError.message).toBe(
                'Failed to create payment session. This may occur if the required component "paypal-payments" is not included in the SDK components array.',
            );
            expect(thrownError.cause).toBe(originalError);
            expect(failedSdkRef.current).toBe(mockSdkInstance);
        });
    });

    describe("retry prevention logic", () => {
        test("should prevent retry if SDK instance already failed", () => {
            // First call fails
            const sessionCreator = jest.fn().mockImplementation(() => {
                throw new Error("Failed");
            });

            const firstResult = createPaymentSession(
                sessionCreator,
                failedSdkRef,
                mockSdkInstance,
                mockSetError,
                "paypal-payments",
            );

            expect(firstResult).toBeNull();
            expect(sessionCreator).toHaveBeenCalledTimes(1);
            expect(failedSdkRef.current).toBe(mockSdkInstance);

            // Clear mocks for second attempt
            jest.clearAllMocks();

            // Second call with same SDK instance should return null immediately
            const secondResult = createPaymentSession(
                sessionCreator,
                failedSdkRef,
                mockSdkInstance,
                mockSetError,
                "paypal-payments",
            );

            expect(secondResult).toBeNull();
            expect(sessionCreator).not.toHaveBeenCalled();
            expect(mockSetError).not.toHaveBeenCalled();
        });

        test("should allow retry with a new SDK instance after previous failure", () => {
            // First call fails
            const failingCreator = jest.fn().mockImplementation(() => {
                throw new Error("Failed");
            });

            createPaymentSession(
                failingCreator,
                failedSdkRef,
                mockSdkInstance,
                mockSetError,
                "paypal-payments",
            );

            expect(failedSdkRef.current).toBe(mockSdkInstance);

            // New SDK instance
            const newSdkInstance = { id: "new-sdk-instance" };
            const mockSession = { start: jest.fn() };
            const successfulCreator = jest.fn().mockReturnValue(mockSession);

            // Should succeed with new SDK instance
            const result = createPaymentSession(
                successfulCreator,
                failedSdkRef,
                newSdkInstance,
                mockSetError,
                "paypal-payments",
            );

            expect(result).toBe(mockSession);
            expect(successfulCreator).toHaveBeenCalledTimes(1);
        });
    });
});

describe("deepEqual", () => {
    describe("primitives", () => {
        test("returns true for identical numbers", () => {
            expect(deepEqual(1, 1)).toBe(true);
        });

        test("returns false for different numbers", () => {
            expect(deepEqual(1, 2)).toBe(false);
        });

        test("returns true for identical strings", () => {
            expect(deepEqual("a", "a")).toBe(true);
        });

        test("returns false for different strings", () => {
            expect(deepEqual("a", "b")).toBe(false);
        });

        test("returns true for identical booleans", () => {
            expect(deepEqual(true, true)).toBe(true);
        });

        test("returns false for different booleans", () => {
            expect(deepEqual(true, false)).toBe(false);
        });

        test("returns false for NaN compared to a number", () => {
            expect(deepEqual(NaN, 1)).toBe(false);
        });

        test("returns false for NaN compared to NaN", () => {
            // NaN !== NaN via ===, and as a non-object primitive the fallthrough returns false
            expect(deepEqual(NaN, NaN)).toBe(false);
        });

        test("returns false for different function references", () => {
            const fn1 = () => 1;
            const fn2 = () => 1;
            expect(deepEqual(fn1, fn2)).toBe(false);
        });

        test("returns true for the same function reference", () => {
            const fn = () => 1;
            expect(deepEqual(fn, fn)).toBe(true);
        });
    });

    describe("null and undefined", () => {
        test("returns true for null vs null", () => {
            expect(deepEqual(null, null)).toBe(true);
        });

        test("returns true for undefined vs undefined", () => {
            expect(deepEqual(undefined, undefined)).toBe(true);
        });

        test("returns false for null vs undefined", () => {
            expect(deepEqual(null, undefined)).toBe(false);
        });

        test("returns false for null vs object", () => {
            expect(deepEqual(null, {})).toBe(false);
        });

        test("returns false for object vs null", () => {
            expect(deepEqual({}, null)).toBe(false);
        });
    });

    describe("type mismatch", () => {
        test("returns false for number vs string", () => {
            expect(deepEqual(1, "1")).toBe(false);
        });

        test("returns false for array vs object", () => {
            expect(deepEqual([1], { 0: 1 })).toBe(false);
        });
    });

    describe("arrays", () => {
        test("returns true for equal arrays", () => {
            expect(deepEqual([1, 2, 3], [1, 2, 3])).toBe(true);
        });

        test("returns false for arrays with different lengths", () => {
            expect(deepEqual([1, 2], [1, 2, 3])).toBe(false);
        });

        test("returns false for arrays with different elements", () => {
            expect(deepEqual([1, 2, 3], [1, 2, 4])).toBe(false);
        });

        test("returns true for nested arrays that are equal", () => {
            expect(deepEqual([[1, 2], [3]], [[1, 2], [3]])).toBe(true);
        });

        test("returns false for nested arrays that differ", () => {
            expect(deepEqual([[1, 2], [3]], [[1, 2], [4]])).toBe(false);
        });
    });

    describe("objects", () => {
        test("returns true for equal flat objects", () => {
            expect(deepEqual({ a: 1, b: "x" }, { a: 1, b: "x" })).toBe(true);
        });

        test("returns false for objects with different values", () => {
            expect(deepEqual({ a: 1 }, { a: 2 })).toBe(false);
        });

        test("returns false for objects with different keys", () => {
            expect(deepEqual({ a: 1 }, { b: 1 })).toBe(false);
        });

        test("returns false for objects with different key counts", () => {
            expect(deepEqual({ a: 1 }, { a: 1, b: 2 })).toBe(false);
        });

        test("returns true for equal nested objects", () => {
            expect(
                deepEqual({ a: { b: { c: 1 } } }, { a: { b: { c: 1 } } }),
            ).toBe(true);
        });

        test("returns false for unequal nested objects", () => {
            expect(
                deepEqual({ a: { b: { c: 1 } } }, { a: { b: { c: 2 } } }),
            ).toBe(false);
        });

        test("returns true for the same reference", () => {
            const obj = { a: 1 };
            expect(deepEqual(obj, obj)).toBe(true);
        });
    });

    describe("depth limit", () => {
        test("returns false when objects exceed max depth", () => {
            // Build a chain 15 levels deep
            type DeepObj = { next?: DeepObj };
            let deep1: DeepObj = {};
            let deep2: DeepObj = {};
            const root1 = deep1;
            const root2 = deep2;
            for (let i = 0; i < 15; i++) {
                deep1.next = {};
                deep2.next = {};
                deep1 = deep1.next;
                deep2 = deep2.next;
            }
            // At default maxDepth=10, comparison stops and returns false
            expect(deepEqual(root1, root2)).toBe(false);
        });
    });
});

describe("useDeepCompareMemoize", () => {
    test("returns the initial value on first render", () => {
        const value = { a: 1 };
        const { result } = renderHook(() => useDeepCompareMemoize(value));
        expect(result.current).toEqual({ a: 1 });
    });

    test("returns the same reference when the value hasn't changed", () => {
        let value = { a: 1 };
        const { result, rerender } = renderHook(() =>
            useDeepCompareMemoize(value),
        );
        const firstRef = result.current;

        // Re-render with a new object reference but same deep value
        value = { a: 1 };
        rerender();

        expect(result.current).toBe(firstRef);
    });

    test("returns a new reference when the value changes", () => {
        let value = { a: 1 };
        const { result, rerender } = renderHook(() =>
            useDeepCompareMemoize(value),
        );
        const firstRef = result.current;

        value = { a: 2 };
        rerender();

        expect(result.current).not.toBe(firstRef);
        expect(result.current).toEqual({ a: 2 });
    });
});

describe("useCompareMemoize", () => {
    test("returns null when passed null", () => {
        const { result } = renderHook(() => useCompareMemoize(null));
        expect(result.current).toBeNull();
    });

    test("returns undefined when passed undefined", () => {
        const { result } = renderHook(() => useCompareMemoize(undefined));
        expect(result.current).toBeUndefined();
    });

    test("returns the same reference when array elements haven't changed", () => {
        let arr = ["paypal-payments", "venmo-payments"] as const;
        const { result, rerender } = renderHook(() => useCompareMemoize(arr));
        const firstRef = result.current;

        // New array reference, same contents
        arr = ["paypal-payments", "venmo-payments"] as const;
        rerender();

        expect(result.current).toBe(firstRef);
    });

    test("returns a new reference when array elements change", () => {
        let arr = ["paypal-payments"] as const;
        const { result, rerender } = renderHook(() => useCompareMemoize(arr));
        const firstRef = result.current;

        // @ts-expect-error — reassigning for test
        arr = ["venmo-payments"];
        rerender();

        expect(result.current).not.toBe(firstRef);
    });

    test("returns a new reference when array length changes", () => {
        let arr:
            | readonly ["paypal-payments"]
            | readonly ["paypal-payments", "venmo-payments"] = [
            "paypal-payments",
        ];
        const { result, rerender } = renderHook(() => useCompareMemoize(arr));
        const firstRef = result.current;

        arr = ["paypal-payments", "venmo-payments"];
        rerender();

        expect(result.current).not.toBe(firstRef);
    });
});
