import React from "react";
import { renderHook } from "@testing-library/react-hooks";

import {
    useEligibleMethods,
    fetchEligibleMethods,
    type FindEligiblePaymentMethodsRequestPayload,
} from "./useEligibleMethods";
import { PayPalContext } from "../context/PayPalProviderContext";
import { INSTANCE_LOADING_STATE } from "../types/PayPalProviderEnums";

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
    function createWrapper(contextValue: Partial<PayPalState>) {
        const fullContext: PayPalState = {
            sdkInstance: null,
            eligiblePaymentMethods: null,
            loadingStatus: INSTANCE_LOADING_STATE.PENDING,
            error: null,
            isHydrated: true,
            setEligibility: jest.fn(),
            ...contextValue,
        };

        return function Wrapper({ children }: { children: React.ReactNode }) {
            return React.createElement(
                PayPalContext.Provider,
                { value: fullContext },
                children,
            );
        };
    }

    describe("context consumption", () => {
        test("should throw error when used outside of PayPalProvider", () => {
            const { result } = renderHook(() => useEligibleMethods());

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

        test("should return null for eligiblePaymentMethods when context has no eligibility data", () => {
            const { result } = renderHook(() => useEligibleMethods(), {
                wrapper: createWrapper({
                    eligiblePaymentMethods: null,
                    loadingStatus: INSTANCE_LOADING_STATE.RESOLVED,
                }),
            });

            expect(result.current.eligiblePaymentMethods).toBe(null);
        });

        test("should return error from context", () => {
            const mockError = new Error("Test error");

            const { result } = renderHook(() => useEligibleMethods(), {
                wrapper: createWrapper({
                    error: mockError,
                    loadingStatus: INSTANCE_LOADING_STATE.REJECTED,
                }),
            });

            expect(result.current.error).toBe(mockError);
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
        test("should return isLoading=true when loadingStatus is PENDING", () => {
            const { result } = renderHook(() => useEligibleMethods(), {
                wrapper: createWrapper({
                    loadingStatus: INSTANCE_LOADING_STATE.PENDING,
                }),
            });

            expect(result.current.isLoading).toBe(true);
        });

        test("should return isLoading=false when loadingStatus is RESOLVED", () => {
            const { result } = renderHook(() => useEligibleMethods(), {
                wrapper: createWrapper({
                    loadingStatus: INSTANCE_LOADING_STATE.RESOLVED,
                }),
            });

            expect(result.current.isLoading).toBe(false);
        });

        test("should return isLoading=false when loadingStatus is REJECTED", () => {
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
        test("should return correct shape with all fields from context", () => {
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

        test("should return correct shape during loading state", () => {
            const { result } = renderHook(() => useEligibleMethods(), {
                wrapper: createWrapper({
                    eligiblePaymentMethods: null,
                    loadingStatus: INSTANCE_LOADING_STATE.PENDING,
                    error: null,
                    isHydrated: true,
                }),
            });

            expect(result.current).toEqual({
                eligiblePaymentMethods: null,
                isLoading: true,
                error: null,
            });
        });

        test("should return correct shape during error state", () => {
            const mockError = new Error("SDK failed to load");

            const { result } = renderHook(() => useEligibleMethods(), {
                wrapper: createWrapper({
                    eligiblePaymentMethods: null,
                    loadingStatus: INSTANCE_LOADING_STATE.REJECTED,
                    error: mockError,
                }),
            });

            expect(result.current).toEqual({
                eligiblePaymentMethods: null,
                isLoading: false,
                error: mockError,
            });
        });
    });
});
