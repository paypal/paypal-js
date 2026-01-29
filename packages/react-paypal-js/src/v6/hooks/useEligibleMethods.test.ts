import React from "react";
import { renderHook } from "@testing-library/react-hooks";

import { useEligibleMethods } from "./useEligibleMethods";
import { PayPalContext } from "../context/PayPalProviderContext";
import { INSTANCE_LOADING_STATE } from "../types/PayPalProviderEnums";

import type { PayPalState } from "../context/PayPalProviderContext";

// Mock fetch globally
global.fetch = jest.fn();

describe("useEligibleMethods", () => {
    // Helper to create a wrapper with mocked context
    function createWrapper(contextValue: Partial<PayPalState>) {
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
