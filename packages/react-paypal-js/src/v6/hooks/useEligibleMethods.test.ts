import React from "react";
import { renderHook, act } from "@testing-library/react-hooks";

import { useEligibleMethods } from "./useEligibleMethods";
import { PayPalContext } from "../context/PayPalProviderContext";
import { PayPalDispatchContext } from "../context/PayPalDispatchContext";
import {
    INSTANCE_DISPATCH_ACTION,
    INSTANCE_LOADING_STATE,
} from "../types/PayPalProviderEnums";

import type { PayPalState } from "../context/PayPalProviderContext";

describe("useEligibleMethods", () => {
    // Helper to create a wrapper with mocked context
    function createWrapper(
        contextValue: Partial<PayPalState>,
        dispatch: jest.Mock = jest.fn(),
    ) {
        const fullContext: PayPalState = {
            sdkInstance: null,
            eligiblePaymentMethods: null,
            loadingStatus: INSTANCE_LOADING_STATE.PENDING,
            error: null,
            isHydrated: true,
            ...contextValue,
        };

        return function Wrapper({ children }: { children: React.ReactNode }) {
            return React.createElement(
                PayPalDispatchContext.Provider,
                { value: dispatch },
                React.createElement(
                    PayPalContext.Provider,
                    { value: fullContext },
                    children,
                ),
            );
        };
    }

    describe("context consumption", () => {
        test("should throw error when used outside of PayPalProvider", () => {
            const { result } = renderHook(() => useEligibleMethods());

            // usePayPal throws first since it's called before usePayPalDispatch
            expect(result.error).toEqual(
                new Error("usePayPal must be used within a PayPalProvider"),
            );
        });

        test("should return eligiblePaymentMethods from context", () => {
            const mockEligibility = {
                isEligible: jest.fn(),
                getDetails: jest.fn(),
            };

            const { result } = renderHook(() => useEligibleMethods(), {
                wrapper: createWrapper({
                    eligiblePaymentMethods: mockEligibility,
                    loadingStatus: INSTANCE_LOADING_STATE.RESOLVED,
                }),
            });

            expect(result.current.eligiblePaymentMethods).toEqual(
                mockEligibility,
            );
        });

        test("should return null initially when no eligibility data and no sdkInstance to fetch with", () => {
            const { result } = renderHook(() => useEligibleMethods(), {
                wrapper: createWrapper({
                    sdkInstance: null,
                    eligiblePaymentMethods: null,
                    loadingStatus: INSTANCE_LOADING_STATE.RESOLVED,
                }),
            });

            // Returns null because no sdkInstance means no fetch can happen
            expect(result.current.eligiblePaymentMethods).toBe(null);
        });

        test("should return wrapped context error when SDK fails to load", () => {
            const mockError = new Error("SDK failed to load");

            const { result } = renderHook(() => useEligibleMethods(), {
                wrapper: createWrapper({
                    error: mockError,
                    loadingStatus: INSTANCE_LOADING_STATE.REJECTED,
                }),
            });

            // Context error is wrapped with a descriptive message
            expect(result.current.error?.message).toBe(
                "PayPal context error: Error: SDK failed to load",
            );
        });

        test("should return null for error when context has no error", () => {
            const { result } = renderHook(() => useEligibleMethods(), {
                wrapper: createWrapper({
                    error: null,
                    isHydrated: true,
                    loadingStatus: INSTANCE_LOADING_STATE.RESOLVED,
                }),
            });

            expect(result.current.error).toBe(null);
        });
    });

    describe("isLoading state", () => {
        test("should return isLoading=true when no eligibility data and no error", () => {
            const { result } = renderHook(() => useEligibleMethods(), {
                wrapper: createWrapper({
                    loadingStatus: INSTANCE_LOADING_STATE.PENDING,
                    eligiblePaymentMethods: null,
                }),
            });

            // isLoading is true when we don't have eligibility data yet
            // This prevents UI flash before effect runs
            expect(result.current.isLoading).toBe(true);
        });

        test("should return isLoading=false when eligibility already in context", () => {
            const mockEligibility = {
                isEligible: jest.fn(),
                getDetails: jest.fn(),
            };

            const { result } = renderHook(() => useEligibleMethods(), {
                wrapper: createWrapper({
                    loadingStatus: INSTANCE_LOADING_STATE.RESOLVED,
                    eligiblePaymentMethods: mockEligibility,
                }),
            });

            // No fetch needed, so isLoading is false
            expect(result.current.isLoading).toBe(false);
        });

        test("should return isLoading=true when context has error but no eligibility data", () => {
            // Context error (SDK load failure) doesn't set eligibilityError,
            // but we still don't have eligibility data, so isLoading is true
            const { result } = renderHook(() => useEligibleMethods(), {
                wrapper: createWrapper({
                    loadingStatus: INSTANCE_LOADING_STATE.REJECTED,
                    error: new Error("Failed"),
                    eligiblePaymentMethods: null,
                }),
            });

            // isLoading is true because we don't have eligibility data
            // The context error is returned separately
            expect(result.current.isLoading).toBe(true);
            expect(result.current.error?.message).toContain(
                "PayPal context error",
            );
        });
    });

    describe("complete return value structure", () => {
        test("should return correct shape with eligibility from context", () => {
            const mockEligibility = {
                isEligible: jest.fn(),
                getDetails: jest.fn(),
            };

            const { result } = renderHook(() => useEligibleMethods(), {
                wrapper: createWrapper({
                    eligiblePaymentMethods: mockEligibility,
                    loadingStatus: INSTANCE_LOADING_STATE.RESOLVED,
                    error: null,
                    isHydrated: true,
                }),
            });

            expect(result.current).toEqual({
                eligiblePaymentMethods: mockEligibility,
                isLoading: false,
                error: null,
            });
        });

        test("should return correct shape when no eligibility and no sdkInstance", () => {
            const { result } = renderHook(() => useEligibleMethods(), {
                wrapper: createWrapper({
                    sdkInstance: null,
                    eligiblePaymentMethods: null,
                    loadingStatus: INSTANCE_LOADING_STATE.PENDING,
                    error: null,
                    isHydrated: true,
                }),
            });

            // isLoading is true because we don't have eligibility data yet
            // This prevents UI flash before the effect has a chance to run
            expect(result.current).toEqual({
                eligiblePaymentMethods: null,
                isLoading: true,
                error: null,
            });
        });

        test("should return correct shape during error state with no eligibility", () => {
            const { result } = renderHook(() => useEligibleMethods(), {
                wrapper: createWrapper({
                    eligiblePaymentMethods: null,
                    loadingStatus: INSTANCE_LOADING_STATE.REJECTED,
                }),
            });

            // isLoading is true because we have no eligibility data and no eligibility error
            // (context error is different from eligibility fetch error)
            expect(result.current).toEqual({
                eligiblePaymentMethods: null,
                isLoading: true,
                error: null,
            });
        });
    });

    describe("fetch behavior", () => {
        const mockEligibilityResult = {
            isEligible: jest.fn(),
            getDetails: jest.fn(),
        };

        function createMockSdkInstance(
            findEligibleMethodsImpl: () => Promise<unknown> = () =>
                Promise.resolve(mockEligibilityResult),
        ) {
            return {
                findEligibleMethods: jest.fn(findEligibleMethodsImpl),
            } as unknown as PayPalState["sdkInstance"];
        }

        test("should fetch eligibility when sdkInstance is available and no eligibility in context", async () => {
            const mockDispatch = jest.fn();
            const mockSdkInstance = createMockSdkInstance();

            renderHook(() => useEligibleMethods(), {
                wrapper: createWrapper(
                    {
                        sdkInstance: mockSdkInstance,
                        eligiblePaymentMethods: null,
                        loadingStatus: INSTANCE_LOADING_STATE.RESOLVED,
                    },
                    mockDispatch,
                ),
            });

            // Wait for the effect to run
            await act(async () => {
                await Promise.resolve();
            });

            expect(mockSdkInstance!.findEligibleMethods).toHaveBeenCalledWith(
                {},
            );
            expect(mockDispatch).toHaveBeenCalledWith({
                type: INSTANCE_DISPATCH_ACTION.SET_ELIGIBILITY,
                value: mockEligibilityResult,
            });
        });

        test("should NOT fetch when eligibility is already in context (server hydration)", async () => {
            const mockDispatch = jest.fn();
            const mockSdkInstance = createMockSdkInstance();

            renderHook(() => useEligibleMethods(), {
                wrapper: createWrapper(
                    {
                        sdkInstance: mockSdkInstance,
                        eligiblePaymentMethods: mockEligibilityResult,
                        loadingStatus: INSTANCE_LOADING_STATE.RESOLVED,
                    },
                    mockDispatch,
                ),
            });

            await act(async () => {
                await Promise.resolve();
            });

            expect(mockSdkInstance!.findEligibleMethods).not.toHaveBeenCalled();
            expect(mockDispatch).not.toHaveBeenCalled();
        });

        test("should NOT fetch when sdkInstance is null", async () => {
            const mockDispatch = jest.fn();

            renderHook(() => useEligibleMethods(), {
                wrapper: createWrapper(
                    {
                        sdkInstance: null,
                        eligiblePaymentMethods: null,
                        loadingStatus: INSTANCE_LOADING_STATE.PENDING,
                    },
                    mockDispatch,
                ),
            });

            await act(async () => {
                await Promise.resolve();
            });

            expect(mockDispatch).not.toHaveBeenCalled();
        });

        test("should set isLoading=true while fetching", async () => {
            let resolvePromise: (value: unknown) => void;
            const pendingPromise = new Promise((resolve) => {
                resolvePromise = resolve;
            });
            const mockSdkInstance = createMockSdkInstance(
                () => pendingPromise as Promise<unknown>,
            );

            const { result } = renderHook(() => useEligibleMethods(), {
                wrapper: createWrapper({
                    sdkInstance: mockSdkInstance,
                    eligiblePaymentMethods: null,
                    loadingStatus: INSTANCE_LOADING_STATE.RESOLVED,
                }),
            });

            // isLoading is true because no eligibility data yet
            expect(result.current.isLoading).toBe(true);

            // After promise resolves, isLoading is still true because
            // eligiblePaymentMethods in context hasn't been updated
            // (dispatch is mocked). In real usage, context would update.
            await act(async () => {
                resolvePromise!(mockEligibilityResult);
            });
            // The fetch itself completes but context isn't updated in this test setup
            // so isLoading remains true. See "isLoading state" tests for cases
            // where eligibility is in context.
            expect(result.current.isLoading).toBe(true);
        });

        test("should return isLoading=false when eligibility data exists", () => {
            const mockSdkInstance = createMockSdkInstance();

            const { result } = renderHook(() => useEligibleMethods(), {
                wrapper: createWrapper({
                    sdkInstance: mockSdkInstance,
                    eligiblePaymentMethods: mockEligibilityResult,
                    loadingStatus: INSTANCE_LOADING_STATE.RESOLVED,
                }),
            });

            // isLoading is false because eligibility data exists in context
            expect(result.current.isLoading).toBe(false);
        });

        test("should set error when fetch fails", async () => {
            const fetchError = new Error("Fetch failed");
            const mockSdkInstance = createMockSdkInstance(() =>
                Promise.reject(fetchError),
            );

            const { result } = renderHook(() => useEligibleMethods(), {
                wrapper: createWrapper({
                    sdkInstance: mockSdkInstance,
                    eligiblePaymentMethods: null,
                    loadingStatus: INSTANCE_LOADING_STATE.RESOLVED,
                }),
            });

            await act(async () => {
                await Promise.resolve();
            });

            expect(result.current.error).toBe(fetchError);
            expect(result.current.isLoading).toBe(false);
        });

        test("should pass payload to findEligibleMethods", async () => {
            const mockSdkInstance = createMockSdkInstance();
            const testPayload = { currency: "USD" };

            renderHook(
                () => useEligibleMethods({ payload: testPayload as never }),
                {
                    wrapper: createWrapper({
                        sdkInstance: mockSdkInstance,
                        eligiblePaymentMethods: null,
                        loadingStatus: INSTANCE_LOADING_STATE.RESOLVED,
                    }),
                },
            );

            await act(async () => {
                await Promise.resolve();
            });

            expect(mockSdkInstance!.findEligibleMethods).toHaveBeenCalledWith(
                testPayload,
            );
        });

        test("should NOT fetch twice for the same sdkInstance and payload", async () => {
            const mockDispatch = jest.fn();
            const mockSdkInstance = createMockSdkInstance();

            const { rerender } = renderHook(() => useEligibleMethods(), {
                wrapper: createWrapper(
                    {
                        sdkInstance: mockSdkInstance,
                        eligiblePaymentMethods: null,
                        loadingStatus: INSTANCE_LOADING_STATE.RESOLVED,
                    },
                    mockDispatch,
                ),
            });

            await act(async () => {
                await Promise.resolve();
            });

            expect(mockSdkInstance!.findEligibleMethods).toHaveBeenCalledTimes(
                1,
            );

            // Rerender the hook
            rerender();

            await act(async () => {
                await Promise.resolve();
            });

            // Should still only be called once
            expect(mockSdkInstance!.findEligibleMethods).toHaveBeenCalledTimes(
                1,
            );
        });

        test("should re-fetch when payload changes", async () => {
            const mockDispatch = jest.fn();
            const mockSdkInstance = createMockSdkInstance();
            let currentPayload = { currency: "USD" };

            const { rerender } = renderHook(
                () =>
                    useEligibleMethods({
                        payload: currentPayload as never,
                    }),
                {
                    wrapper: createWrapper(
                        {
                            sdkInstance: mockSdkInstance,
                            eligiblePaymentMethods: null,
                            loadingStatus: INSTANCE_LOADING_STATE.RESOLVED,
                        },
                        mockDispatch,
                    ),
                },
            );

            await act(async () => {
                await Promise.resolve();
            });

            expect(mockSdkInstance!.findEligibleMethods).toHaveBeenCalledTimes(
                1,
            );
            expect(mockSdkInstance!.findEligibleMethods).toHaveBeenCalledWith({
                currency: "USD",
            });

            // Change the payload
            currentPayload = { currency: "EUR" };
            rerender();

            await act(async () => {
                await Promise.resolve();
            });

            // Should be called again with new payload
            expect(mockSdkInstance!.findEligibleMethods).toHaveBeenCalledTimes(
                2,
            );
            expect(
                mockSdkInstance!.findEligibleMethods,
            ).toHaveBeenLastCalledWith({
                currency: "EUR",
            });
        });

        test("should NOT re-fetch when payload object reference changes but content is the same", async () => {
            const mockDispatch = jest.fn();
            const mockSdkInstance = createMockSdkInstance();

            // Use a variable to track the payload passed to the hook
            let currentPayload = { currency: "USD" };

            const { rerender } = renderHook(
                () =>
                    useEligibleMethods({
                        payload: currentPayload as never,
                    }),
                {
                    wrapper: createWrapper(
                        {
                            sdkInstance: mockSdkInstance,
                            eligiblePaymentMethods: null,
                            loadingStatus: INSTANCE_LOADING_STATE.RESOLVED,
                        },
                        mockDispatch,
                    ),
                },
            );

            await act(async () => {
                await Promise.resolve();
            });

            expect(mockSdkInstance!.findEligibleMethods).toHaveBeenCalledTimes(
                1,
            );

            // Create new object reference but same content
            currentPayload = { currency: "USD" };
            rerender();

            await act(async () => {
                await Promise.resolve();
            });

            // Should still only be called once (deep comparison prevents re-fetch)
            expect(mockSdkInstance!.findEligibleMethods).toHaveBeenCalledTimes(
                1,
            );
        });
    });
});
