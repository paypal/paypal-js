import React from "react";
import { renderHook, act } from "@testing-library/react-hooks";

import {
    useEligibleMethods,
    fetchEligibleMethods,
    type FindEligiblePaymentMethodsRequestPayload,
} from "./useEligibleMethods";
import { PayPalContext } from "../context/PayPalProviderContext";
import { PayPalDispatchContext } from "../context/PayPalDispatchContext";
import {
    INSTANCE_DISPATCH_ACTION,
    INSTANCE_LOADING_STATE,
} from "../types/PayPalProviderEnums";

import type { FindEligiblePaymentMethodsResponse } from "../types";
import type { PayPalState } from "../context/PayPalProviderContext";

// Mock fetch globally
global.fetch = jest.fn();

describe("fetchEligibleMethods", () => {
    const mockClientToken = "test-client-token";
    const mockPayload: FindEligiblePaymentMethodsRequestPayload = {
        purchase_units: [
            {
                amount: {
                    currency_code: "USD",
                },
            },
        ],
    };

    const mockResponse: FindEligiblePaymentMethodsResponse = {
        eligible_methods: {
            paypal: {
                can_be_vaulted: true,
                eligible_in_paypal_network: true,
                recommended: true,
            },
            venmo: {
                can_be_vaulted: false,
                eligible_in_paypal_network: true,
            },
        },
        supplementary_data: {
            buyer_country_code: "US",
        },
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("should successfully fetch eligible methods with sandbox environment", async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => mockResponse,
        });

        const result = await fetchEligibleMethods({
            clientToken: mockClientToken,
            payload: mockPayload,
            environment: "sandbox",
        });

        expect(global.fetch).toHaveBeenCalledWith(
            "https://api-m.sandbox.paypal.com/v2/payments/find-eligible-methods",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${mockClientToken}`,
                    Accept: "application/json",
                    "Accept-Language": "en-US,en;q=0.9",
                },
                body: JSON.stringify(mockPayload),
                signal: undefined,
            },
        );

        expect(result).toEqual(mockResponse);
    });

    test("should successfully fetch eligible methods with production environment", async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => mockResponse,
        });

        await fetchEligibleMethods({
            clientToken: mockClientToken,
            payload: mockPayload,
            environment: "production",
        });

        expect(global.fetch).toHaveBeenCalledWith(
            "https://api-m.paypal.com/v2/payments/find-eligible-methods",
            expect.objectContaining({
                method: "POST",
            }),
        );
    });

    test("should send empty payload when no payload is provided", async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => mockResponse,
        });

        await fetchEligibleMethods({
            clientToken: mockClientToken,
            environment: "sandbox",
        });

        expect(global.fetch).toHaveBeenCalledWith(
            expect.any(String),
            expect.objectContaining({
                body: JSON.stringify({}),
            }),
        );
    });

    test("should handle HTTP error responses", async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: false,
            status: 401,
        });

        await expect(
            fetchEligibleMethods({
                clientToken: mockClientToken,
                environment: "sandbox",
            }),
        ).rejects.toThrow("Eligibility API error: 401");
    });

    test("should handle network errors", async () => {
        (global.fetch as jest.Mock).mockRejectedValueOnce(
            new Error("Network error"),
        );

        await expect(
            fetchEligibleMethods({
                clientToken: mockClientToken,
                environment: "sandbox",
            }),
        ).rejects.toThrow("Failed to fetch eligible methods: Network error");
    });

    test("should support abort signal", async () => {
        const abortController = new AbortController();
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => mockResponse,
        });

        await fetchEligibleMethods({
            clientToken: mockClientToken,
            environment: "sandbox",
            signal: abortController.signal,
        });

        expect(global.fetch).toHaveBeenCalledWith(
            expect.any(String),
            expect.objectContaining({
                signal: abortController.signal,
            }),
        );
    });
});

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

            // Context error is wrapped with a descriptive message and preserves original via cause
            expect(result.current.error?.message).toBe(
                "PayPal context error: SDK failed to load",
            );
            expect(result.current.error?.cause).toBe(mockError);
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
        test("should return isLoading=false initially when not fetching", () => {
            const { result } = renderHook(() => useEligibleMethods(), {
                wrapper: createWrapper({
                    loadingStatus: INSTANCE_LOADING_STATE.PENDING,
                }),
            });

            // isLoading reflects isFetching state, not loadingStatus
            // Initially false because no fetch has started yet (no sdkInstance)
            expect(result.current.isLoading).toBe(false);
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

        test("should return isLoading=false when context has error", () => {
            const { result } = renderHook(() => useEligibleMethods(), {
                wrapper: createWrapper({
                    loadingStatus: INSTANCE_LOADING_STATE.REJECTED,
                    error: new Error("Failed"),
                }),
            });

            expect(result.current.isLoading).toBe(false);
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

            // isLoading is false because no fetch has started (no sdkInstance)
            expect(result.current).toEqual({
                eligiblePaymentMethods: null,
                isLoading: false,
                error: null,
            });
        });

        test("should return correct shape during error state", () => {
            const { result } = renderHook(() => useEligibleMethods(), {
                wrapper: createWrapper({
                    eligiblePaymentMethods: null,
                    loadingStatus: INSTANCE_LOADING_STATE.REJECTED,
                }),
            });

            // Error from hook's local state, not context
            expect(result.current).toEqual({
                eligiblePaymentMethods: null,
                isLoading: false,
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

        test("should NOT fetch when eligibility is already in context", async () => {
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

        test("should set isLoading=true while fetching and false after", async () => {
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

            // Effect runs synchronously, so isLoading is already true
            expect(result.current.isLoading).toBe(true);

            // After promise resolves, should be false
            await act(async () => {
                resolvePromise!(mockEligibilityResult);
            });
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

        test("should NOT fetch twice for the same sdkInstance", async () => {
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
    });
});
