import { renderHook, act } from "@testing-library/react-hooks";
import React, { useContext, useState } from "react";
import { mock } from "jest-mock-extended";

import {
    CardFieldsSessionContext,
    CardFieldsStatusContext,
} from "./PayPalCardFieldsProviderContext";
import {
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
        const { result } = renderHook(() =>
            useContext(CardFieldsSessionContext),
        );
        expect(result.current).toBeNull();
    });

    it("should provide context value when wrapped", () => {
        const mockSession = createMockCardFieldsSession();
        const mockSetCardFieldsSessionType = jest.fn();
        function Wrapper({ children }: { children: React.ReactNode }) {
            return React.createElement(
                CardFieldsSessionContext.Provider,
                {
                    value: {
                        cardFieldsSession: mockSession,
                        setCardFieldsSessionType: mockSetCardFieldsSessionType,
                        setError: jest.fn(),
                    },
                },
                children,
            );
        }

        const { result } = renderHook(
            () => useContext(CardFieldsSessionContext),
            {
                wrapper: Wrapper,
            },
        );

        expect(result.current).not.toBeNull();
        expect(result.current?.cardFieldsSession).toBe(mockSession);
        expect(result.current?.setCardFieldsSessionType).toBe(
            mockSetCardFieldsSessionType,
        );
    });

    it("should allow updating cardFieldsSessionType via setter", () => {
        const setSessionType = jest.fn();
        function Wrapper({ children }: { children: React.ReactNode }) {
            const [cardFieldsSession] = useState(null);
            return React.createElement(
                CardFieldsSessionContext.Provider,
                {
                    value: {
                        cardFieldsSession,
                        setCardFieldsSessionType: setSessionType,
                        setError: jest.fn(),
                    },
                },
                children,
            );
        }

        const { result } = renderHook(
            () => useContext(CardFieldsSessionContext),
            {
                wrapper: Wrapper,
            },
        );

        expect(result.current?.cardFieldsSession).toBeNull();

        act(() => {
            result.current?.setCardFieldsSessionType(
                "vaulting" as CardFieldsSessionType,
            );
        });

        expect(setSessionType).toHaveBeenCalledWith("vaulting");
    });

    it("should allow updating error via setter", () => {
        const mockSetError = jest.fn();
        function Wrapper({ children }: { children: React.ReactNode }) {
            const [cardFieldsSession] = useState(null);
            return React.createElement(
                CardFieldsSessionContext.Provider,
                {
                    value: {
                        cardFieldsSession,
                        setCardFieldsSessionType: jest.fn(),
                        setError: mockSetError,
                    },
                },
                children,
            );
        }

        const { result } = renderHook(
            () => useContext(CardFieldsSessionContext),
            {
                wrapper: Wrapper,
            },
        );

        const testError = new Error("Test error");

        act(() => {
            result.current?.setError(testError);
        });

        expect(mockSetError).toHaveBeenCalledWith(testError);
    });

    it("should handle null cardFieldsSession", () => {
        const mockSetCardFieldsSessionType = jest.fn();
        function Wrapper({ children }: { children: React.ReactNode }) {
            return React.createElement(
                CardFieldsSessionContext.Provider,
                {
                    value: {
                        cardFieldsSession: null,
                        setCardFieldsSessionType: mockSetCardFieldsSessionType,
                        setError: jest.fn(),
                    },
                },
                children,
            );
        }

        const { result } = renderHook(
            () => useContext(CardFieldsSessionContext),
            {
                wrapper: Wrapper,
            },
        );

        expect(result.current?.cardFieldsSession).toBeNull();
        expect(result.current?.setCardFieldsSessionType).toBeDefined();
    });
});

describe("CardFieldsStatusContext", () => {
    it("should have default value as null when not wrapped", () => {
        const { result } = renderHook(() =>
            useContext(CardFieldsStatusContext),
        );
        expect(result.current).toBeNull();
    });

    it("should provide context value when wrapped with no error", () => {
        function Wrapper({ children }: { children: React.ReactNode }) {
            return React.createElement(
                CardFieldsStatusContext.Provider,
                { value: { error: null } },
                children,
            );
        }

        const { result } = renderHook(
            () => useContext(CardFieldsStatusContext),
            {
                wrapper: Wrapper,
            },
        );

        expect(result.current).not.toBeNull();
        expect(result.current?.error).toBeNull();
    });

    it("should provide context value when wrapped with error", () => {
        const mockError = new Error("Card fields initialization failed");
        function Wrapper({ children }: { children: React.ReactNode }) {
            return React.createElement(
                CardFieldsStatusContext.Provider,
                { value: { error: mockError } },
                children,
            );
        }

        const { result } = renderHook(
            () => useContext(CardFieldsStatusContext),
            {
                wrapper: Wrapper,
            },
        );

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
            function Wrapper({ children }: { children: React.ReactNode }) {
                return React.createElement(
                    CardFieldsStatusContext.Provider,
                    { value: { error } },
                    children,
                );
            }

            const { result } = renderHook(
                () => useContext(CardFieldsStatusContext),
                {
                    wrapper: Wrapper,
                },
            );

            expect(result.current?.error).toBe(error);
        });
    });
});
