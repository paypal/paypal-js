import { renderHook, act } from "@testing-library/react-hooks";
import React, { useContext, useState } from "react";
import { mock } from "jest-mock-extended";

import {
    CardFieldsSessionContext,
    CardFieldsStatusContext,
} from "./PayPalCardFieldsProviderContext";

import type {
    CardFieldsSession,
    CardFieldsSessionType,
} from "../components/PayPalCardFieldsProvider";

// Test utilities and mock factories
function createMockCardFieldsSession() {
    return mock<CardFieldsSession>({
        submit: jest.fn().mockResolvedValue({}),
    });
}

describe("CardFieldsSessionContext", () => {
    it("should have default value as null when not wrapped", () => {
        function useTestContext() {
            return useContext(CardFieldsSessionContext);
        }
        const { result } = renderHook(() => useTestContext());
        expect(result.current).toBeNull();
    });

    it("should provide context value when wrapped", () => {
        const mockSession = createMockCardFieldsSession();
        const mockSetCardFieldsSessionType = jest.fn();
        const Wrapper: React.FC = ({ children }) => (
            <CardFieldsSessionContext.Provider
                value={{
                    cardFieldsSession: mockSession,
                    setCardFieldsSessionType: mockSetCardFieldsSessionType,
                }}
            >
                {children}
            </CardFieldsSessionContext.Provider>
        );

        function useTestContext() {
            return useContext(CardFieldsSessionContext);
        }

        const { result } = renderHook(() => useTestContext(), {
            wrapper: Wrapper,
        });

        expect(result.current).not.toBeNull();
        expect(result.current?.cardFieldsSession).toBe(mockSession);
        expect(result.current?.setCardFieldsSessionType).toBe(
            mockSetCardFieldsSessionType,
        );
    });

    it("should allow updating cardFieldsSessionType via setter", () => {
        const Wrapper: React.FC = ({ children }) => {
            const [cardFieldsSession] = useState<CardFieldsSession | null>(
                null,
            );
            const [, setSessionType] = useState<CardFieldsSessionType | null>(
                null,
            );

            const setCardFieldsSessionType = (
                cardFieldsSessionType: CardFieldsSessionType,
            ) => {
                setSessionType(cardFieldsSessionType);
            };

            return (
                <CardFieldsSessionContext.Provider
                    value={{ cardFieldsSession, setCardFieldsSessionType }}
                >
                    {children}
                </CardFieldsSessionContext.Provider>
            );
        };

        function useTestContext() {
            return useContext(CardFieldsSessionContext);
        }

        const { result } = renderHook(() => useTestContext(), {
            wrapper: Wrapper,
        });

        expect(result.current?.cardFieldsSession).toBeNull();

        act(() => {
            result.current?.setCardFieldsSessionType(
                "vaulting" as CardFieldsSessionType,
            );
        });

        expect(result.current?.setCardFieldsSessionType).toBeDefined();
        expect(typeof result.current?.setCardFieldsSessionType).toBe(
            "function",
        );
    });

    it("should handle null cardFieldsSession", () => {
        const mockSetCardFieldsSessionType = jest.fn();
        const Wrapper: React.FC = ({ children }) => (
            <CardFieldsSessionContext.Provider
                value={{
                    cardFieldsSession: null,
                    setCardFieldsSessionType: mockSetCardFieldsSessionType,
                }}
            >
                {children}
            </CardFieldsSessionContext.Provider>
        );

        function useTestContext() {
            return useContext(CardFieldsSessionContext);
        }

        const { result } = renderHook(() => useTestContext(), {
            wrapper: Wrapper,
        });

        expect(result.current?.cardFieldsSession).toBeNull();
        expect(result.current?.setCardFieldsSessionType).toBeDefined();
    });
});

describe("CardFieldsStatusContext", () => {
    it("should have default value as null when not wrapped", () => {
        function useTestContext() {
            return useContext(CardFieldsStatusContext);
        }
        const { result } = renderHook(() => useTestContext());
        expect(result.current).toBeNull();
    });

    it("should provide context value when wrapped with no error", () => {
        const Wrapper: React.FC = ({ children }) => (
            <CardFieldsStatusContext.Provider value={{ error: null }}>
                {children}
            </CardFieldsStatusContext.Provider>
        );

        function useTestContext() {
            return useContext(CardFieldsStatusContext);
        }

        const { result } = renderHook(() => useTestContext(), {
            wrapper: Wrapper,
        });

        expect(result.current).not.toBeNull();
        expect(result.current?.error).toBeNull();
    });

    it("should provide context value when wrapped with error", () => {
        const mockError = new Error("Card fields initialization failed");
        const Wrapper: React.FC = ({ children }) => (
            <CardFieldsStatusContext.Provider value={{ error: mockError }}>
                {children}
            </CardFieldsStatusContext.Provider>
        );

        function useTestContext() {
            return useContext(CardFieldsStatusContext);
        }

        const { result } = renderHook(() => useTestContext(), {
            wrapper: Wrapper,
        });

        expect(result.current).not.toBeNull();
        expect(result.current?.error).toBe(mockError);
        expect(result.current?.error?.message).toBe(
            "Card fields initialization failed",
        );
    });

    it("should handle different error types", () => {
        const testCases = [
            new Error("Generic error"),
            new TypeError("Type error"),
            new RangeError("Range error"),
        ];

        testCases.forEach((error) => {
            const Wrapper: React.FC = ({ children }) => (
                <CardFieldsStatusContext.Provider value={{ error }}>
                    {children}
                </CardFieldsStatusContext.Provider>
            );

            function useTestContext() {
                return useContext(CardFieldsStatusContext);
            }

            const { result } = renderHook(() => useTestContext(), {
                wrapper: Wrapper,
            });

            expect(result.current?.error).toBe(error);
        });
    });
});
