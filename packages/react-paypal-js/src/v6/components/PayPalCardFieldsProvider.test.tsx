import React from "react";
import { act, renderHook } from "@testing-library/react-hooks";

import { usePayPal } from "../hooks/usePayPal";
import { INSTANCE_LOADING_STATE } from "../types";
import { expectCurrentErrorValue } from "../hooks/useErrorTestUtil";
import {
    CARD_FIELDS_SESSION_TYPES,
    PayPalCardFieldsProvider,
} from "./PayPalCardFieldsProvider";
import {
    usePayPalCardFields,
    usePayPalCardFieldsSession,
} from "../hooks/usePayPalCardFields";
import { toError, useDeepCompareMemoize } from "../utils";

import type {
    CardFieldsOneTimePaymentSession,
    CardFieldsSavePaymentSession,
} from "../types";
import type {
    CardFieldsSessionState,
    CardFieldsStatusState,
} from "../context/PayPalCardFieldsProviderContext";

jest.mock("../hooks/usePayPal");

const mockUsePayPal = usePayPal as jest.MockedFunction<typeof usePayPal>;

// Mock Factories
const createMockOneTimePaymentSession =
    (): CardFieldsOneTimePaymentSession => ({
        createCardFieldsComponent: jest.fn(),
        on: jest.fn() as jest.MockedFunction<
            CardFieldsOneTimePaymentSession["on"]
        >,
        submit: jest.fn() as jest.MockedFunction<
            CardFieldsOneTimePaymentSession["submit"]
        >,
        update: jest.fn() as jest.MockedFunction<
            CardFieldsOneTimePaymentSession["update"]
        >,
    });

const createMockSavePaymentSession = (): CardFieldsSavePaymentSession => ({
    createCardFieldsComponent: jest.fn(),
    on: jest.fn() as jest.MockedFunction<CardFieldsSavePaymentSession["on"]>,
    submit: jest.fn() as jest.MockedFunction<
        CardFieldsSavePaymentSession["submit"]
    >,
    update: jest.fn() as jest.MockedFunction<
        CardFieldsSavePaymentSession["update"]
    >,
});

const createMockSdkInstance = ({
    cardFieldsOneTimePaymentSession = createMockOneTimePaymentSession(),
    cardFieldsSavePaymentSession = createMockSavePaymentSession(),
}: {
    cardFieldsOneTimePaymentSession?: CardFieldsOneTimePaymentSession;
    cardFieldsSavePaymentSession?: CardFieldsSavePaymentSession;
} = {}) => ({
    createCardFieldsOneTimePaymentSession: jest
        .fn()
        .mockReturnValue(cardFieldsOneTimePaymentSession),
    createCardFieldsSavePaymentSession: jest
        .fn()
        .mockReturnValue(cardFieldsSavePaymentSession),
});

// Render helper
function renderCardFieldsProvider() {
    return renderHook(
        () => ({
            status: usePayPalCardFields(),
            session: usePayPalCardFieldsSession(),
        }),
        {
            wrapper: ({ children }) => (
                <PayPalCardFieldsProvider>{children}</PayPalCardFieldsProvider>
            ),
        },
    );
}

describe("PayPalCardFieldsProvider", () => {
    let mockCardFieldsOneTimePaymentSession: CardFieldsOneTimePaymentSession;
    let mockCardFieldsSavePaymentSession: CardFieldsSavePaymentSession;
    let mockSdkInstance: ReturnType<typeof createMockSdkInstance>;

    beforeEach(() => {
        mockCardFieldsOneTimePaymentSession = createMockOneTimePaymentSession();
        mockCardFieldsSavePaymentSession = createMockSavePaymentSession();
        mockSdkInstance = createMockSdkInstance({
            cardFieldsOneTimePaymentSession:
                mockCardFieldsOneTimePaymentSession,
            cardFieldsSavePaymentSession: mockCardFieldsSavePaymentSession,
        });

        mockUsePayPal.mockReturnValue({
            // @ts-expect-error mocking sdk instance
            sdkInstance: mockSdkInstance,
            loadingStatus: INSTANCE_LOADING_STATE.RESOLVED,
            eligiblePaymentMethods: null,
            error: null,
            isHydrated: true,
            setEligibility: jest.fn(),
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("initialization", () => {
        test("should not error if there is no sdkInstance but loading is still pending", () => {
            mockUsePayPal.mockReturnValue({
                sdkInstance: null,
                loadingStatus: INSTANCE_LOADING_STATE.PENDING,
                eligiblePaymentMethods: null,
                error: null,
                isHydrated: true,
                setEligibility: jest.fn(),
            });

            const { result } = renderCardFieldsProvider();

            expect(result.current.session.cardFieldsSession).toBeNull();
            expect(result.current.status.error).toBeNull();
            expectCurrentErrorValue(result.current.status.error);
        });

        test("should error if there is no sdkInstance and loading is rejected", () => {
            mockUsePayPal.mockReturnValue({
                sdkInstance: null,
                loadingStatus: INSTANCE_LOADING_STATE.REJECTED,
                eligiblePaymentMethods: null,
                error: null,
                isHydrated: true,
                setEligibility: jest.fn(),
            });

            const { result } = renderCardFieldsProvider();

            expect(result.current.session.cardFieldsSession).toBeNull();
            expect(result.current.status.error).toEqual(
                toError("no sdk instance available"),
            );
            expectCurrentErrorValue(result.current.status.error);
        });

        test("should clear any sdkInstance related errors if the sdkInstance becomes available", () => {
            // First render: no sdkInstance and not in PENDING state, should error
            mockUsePayPal.mockReturnValue({
                sdkInstance: null,
                loadingStatus: INSTANCE_LOADING_STATE.REJECTED,
                eligiblePaymentMethods: null,
                error: null,
                isHydrated: true,
                setEligibility: jest.fn(),
            });

            const { result, rerender } = renderCardFieldsProvider();

            expect(result.current.session.cardFieldsSession).toBeNull();
            expect(result.current.status.error).toEqual(
                toError("no sdk instance available"),
            );
            expectCurrentErrorValue(result.current.status.error);

            // Second render: sdkInstance becomes available, error should clear
            mockUsePayPal.mockReturnValue({
                // @ts-expect-error mocking sdk instance
                sdkInstance: mockSdkInstance,
                loadingStatus: INSTANCE_LOADING_STATE.RESOLVED,
                eligiblePaymentMethods: null,
                error: null,
                isHydrated: true,
                setEligibility: jest.fn(),
            });

            rerender();
            expect(result.current.session.cardFieldsSession).toBeNull();
            expect(result.current.status.error).toBeNull();
            expectCurrentErrorValue(result.current.status.error);
        });
    });

    describe("session creation", () => {
        test("should not create a session if sessionType is not set", () => {
            const { result } = renderCardFieldsProvider();

            expect(result.current.session.cardFieldsSession).toBeNull();
            expect(result.current.status.error).toBeNull();
            expectCurrentErrorValue(result.current.status.error);
            expect(
                mockSdkInstance.createCardFieldsOneTimePaymentSession,
            ).not.toHaveBeenCalled();
            expect(
                mockSdkInstance.createCardFieldsSavePaymentSession,
            ).not.toHaveBeenCalled();
        });

        test("should create one-time-payment session when sessionType is set to one-time-payment", () => {
            const { result } = renderCardFieldsProvider();

            act(() => {
                result.current.session.setCardFieldsSessionType(
                    CARD_FIELDS_SESSION_TYPES.ONE_TIME_PAYMENT,
                );
            });

            // Check that the correct session was created and set
            expect(
                mockSdkInstance.createCardFieldsOneTimePaymentSession,
            ).toHaveBeenCalled();
            expect(result.current.session.cardFieldsSession).toBe(
                mockCardFieldsOneTimePaymentSession,
            );
            expect(result.current.status.error).toBeNull();
            expectCurrentErrorValue(result.current.status.error);
        });

        test("should create save-payment session when sessionType is set to save-payment", () => {
            const { result } = renderCardFieldsProvider();

            act(() => {
                result.current.session.setCardFieldsSessionType(
                    CARD_FIELDS_SESSION_TYPES.SAVE_PAYMENT,
                );
            });

            // Check that the correct session was created and set
            expect(
                mockSdkInstance.createCardFieldsSavePaymentSession,
            ).toHaveBeenCalled();
            expect(result.current.session.cardFieldsSession).toBe(
                mockCardFieldsSavePaymentSession,
            );
            expect(result.current.status.error).toBeNull();
            expectCurrentErrorValue(result.current.status.error);
        });

        test("should handle errors when creating a session", () => {
            const errorMessage = "Failed to create session";

            mockSdkInstance.createCardFieldsOneTimePaymentSession.mockImplementationOnce(
                () => {
                    throw new Error(errorMessage);
                },
            );

            const { result } = renderCardFieldsProvider();

            act(() =>
                result.current.session.setCardFieldsSessionType(
                    CARD_FIELDS_SESSION_TYPES.ONE_TIME_PAYMENT,
                ),
            );

            expect(result.current.session.cardFieldsSession).toBeNull();
            expect(result.current.status.error).toEqual(toError(errorMessage));
            expectCurrentErrorValue(result.current.status.error);
        });

        test("should create new session when the provider re-runs with a new sdkInstance", () => {
            // Initial render with first mockSdkInstance
            const { result, rerender } = renderCardFieldsProvider();
            act(() => {
                result.current.session.setCardFieldsSessionType(
                    CARD_FIELDS_SESSION_TYPES.ONE_TIME_PAYMENT,
                );
            });

            expect(result.current.session.cardFieldsSession).toBe(
                mockCardFieldsOneTimePaymentSession,
            );

            // Create a new mockSdkInstance with different session instances
            jest.clearAllMocks();
            const newMockCardFieldsOneTimePaymentSession =
                createMockOneTimePaymentSession();
            const newMockCardFieldsSavePaymentSession =
                createMockSavePaymentSession();
            const newMockSdkInstance = createMockSdkInstance({
                cardFieldsOneTimePaymentSession:
                    newMockCardFieldsOneTimePaymentSession,
                cardFieldsSavePaymentSession:
                    newMockCardFieldsSavePaymentSession,
            });

            mockUsePayPal.mockReturnValue({
                // @ts-expect-error mocking sdk instance
                sdkInstance: newMockSdkInstance,
                loadingStatus: INSTANCE_LOADING_STATE.RESOLVED,
                eligiblePaymentMethods: null,
                error: null,
                isHydrated: true,
                setEligibility: jest.fn(),
            });

            rerender();
            expect(
                newMockSdkInstance.createCardFieldsOneTimePaymentSession,
            ).toHaveBeenCalled();
            expect(result.current.session.cardFieldsSession).toBe(
                newMockCardFieldsOneTimePaymentSession,
            );
            expect(result.current.session.cardFieldsSession).not.toBe(
                mockCardFieldsOneTimePaymentSession,
            );
            expect(result.current.status.error).toBeNull();
            expectCurrentErrorValue(result.current.status.error);
        });
    });

    describe("Context isolation", () => {
        const expectedSessionContextKeys = [
            "cardFieldsSession",
            "setCardFieldsSessionType",
        ] as const satisfies (keyof CardFieldsSessionState)[];
        const expectedStatusContextKeys = [
            "error",
        ] as const satisfies (keyof CardFieldsStatusState)[];

        describe("usePayPalCardFields", () => {
            test("should only return status context values", () => {
                const { result } = renderCardFieldsProvider();

                const receivedStatusKeys = Object.keys(result.current.status);
                expect(receivedStatusKeys.sort()).toEqual(
                    [...expectedStatusContextKeys].sort(),
                );
            });

            test("should not return session context values", () => {
                const { result } = renderCardFieldsProvider();

                const receivedStatusKeys = Object.keys(result.current.status);
                expectedSessionContextKeys.forEach((key) => {
                    expect(receivedStatusKeys).not.toContain(key);
                });
            });
        });

        describe("usePayPalCardFieldsSession", () => {
            test("should only return session context values", () => {
                const { result } = renderCardFieldsProvider();

                const receivedSessionKeys = Object.keys(result.current.session);
                expect(receivedSessionKeys.sort()).toEqual(
                    [...expectedSessionContextKeys].sort(),
                );
            });

            test("should not return status context values", () => {
                const { result } = renderCardFieldsProvider();

                const receivedSesssionKeys = Object.keys(
                    result.current.session,
                );
                expectedStatusContextKeys.forEach((key) => {
                    expect(receivedSesssionKeys).not.toContain(key);
                });
            });
        });
    });

    describe("event handlers", () => {
        test("should register event handlers on session creation", () => {
            const onBlur = jest.fn();
            const onValidityChange = jest.fn();
            const onCardTypeChange = jest.fn();

            const { result } = renderHook(
                () => ({
                    status: usePayPalCardFields(),
                    session: usePayPalCardFieldsSession(),
                }),
                {
                    wrapper: ({ children }) => (
                        <PayPalCardFieldsProvider
                            blur={onBlur}
                            validitychange={onValidityChange}
                            cardtypechange={onCardTypeChange}
                        >
                            {children}
                        </PayPalCardFieldsProvider>
                    ),
                },
            );

            act(() => {
                result.current.session.setCardFieldsSessionType(
                    CARD_FIELDS_SESSION_TYPES.ONE_TIME_PAYMENT,
                );
            });

            // Check that on() was called with the correct event names
            expect(
                mockCardFieldsOneTimePaymentSession.on,
            ).toHaveBeenCalledTimes(3);

            const calls = (mockCardFieldsOneTimePaymentSession.on as jest.Mock)
                .mock.calls;

            // Verify event names are registered
            const eventNames = calls.map((call) => call[0]);
            expect(eventNames).toContain("blur");
            expect(eventNames).toContain("validitychange");
            expect(eventNames).toContain("cardtypechange");

            // Verify handlers work by calling them (they're wrapped by proxy)
            const blurCall = calls.find((call) => call[0] === "blur");
            const validityCall = calls.find(
                (call) => call[0] === "validitychange",
            );
            const cardTypeCall = calls.find(
                (call) => call[0] === "cardtypechange",
            );

            // Test that the proxy handlers call the original functions
            blurCall?.[1]?.({});
            expect(onBlur).toHaveBeenCalled();

            validityCall?.[1]?.({});
            expect(onValidityChange).toHaveBeenCalled();

            cardTypeCall?.[1]?.({});
            expect(onCardTypeChange).toHaveBeenCalled();
        });

        test("should only register handlers that are provided", () => {
            const onFocus = jest.fn();

            const { result } = renderHook(
                () => ({
                    status: usePayPalCardFields(),
                    session: usePayPalCardFieldsSession(),
                }),
                {
                    wrapper: ({ children }) => (
                        <PayPalCardFieldsProvider focus={onFocus}>
                            {children}
                        </PayPalCardFieldsProvider>
                    ),
                },
            );

            act(() => {
                result.current.session.setCardFieldsSessionType(
                    CARD_FIELDS_SESSION_TYPES.ONE_TIME_PAYMENT,
                );
            });

            // Should only register focus handler
            expect(
                mockCardFieldsOneTimePaymentSession.on,
            ).toHaveBeenCalledTimes(1);

            const calls = (mockCardFieldsOneTimePaymentSession.on as jest.Mock)
                .mock.calls;
            expect(calls[0][0]).toBe("focus");

            // Test that the proxy handler calls the original function
            calls[0][1]?.({});
            expect(onFocus).toHaveBeenCalled();
        });

        test("should handle errors when registering event handlers", () => {
            const onBlur = jest.fn();
            const errorMessage = "Failed to register handler";

            (
                mockCardFieldsOneTimePaymentSession.on as jest.Mock
            ).mockImplementationOnce(() => {
                throw new Error(errorMessage);
            });

            const { result } = renderHook(
                () => ({
                    status: usePayPalCardFields(),
                    session: usePayPalCardFieldsSession(),
                }),
                {
                    wrapper: ({ children }) => (
                        <PayPalCardFieldsProvider blur={onBlur}>
                            {children}
                        </PayPalCardFieldsProvider>
                    ),
                },
            );

            act(() => {
                result.current.session.setCardFieldsSessionType(
                    CARD_FIELDS_SESSION_TYPES.ONE_TIME_PAYMENT,
                );
            });

            // The error message will include "Error: " prefix when Error is converted to string
            expect(result.current.status.error).toEqual(
                toError(
                    `Failed to register event handlers: Error: ${errorMessage}`,
                ),
            );
            expectCurrentErrorValue(result.current.status.error);
        });

        test("should NOT call update when amount reference changes but value is the same (deep compare)", () => {
            function TestProvider({ children }: { children: React.ReactNode }) {
                // Always creates a new object, but useDeepCompareMemoize will prevent unnecessary updates
                const memoizedAmount = useDeepCompareMemoize({
                    currencyCode: "USD",
                    value: "100.00",
                });
                return (
                    <PayPalCardFieldsProvider amount={memoizedAmount}>
                        {children}
                    </PayPalCardFieldsProvider>
                );
            }

            const { result, rerender } = renderHook(
                () => ({
                    status: usePayPalCardFields(),
                    session: usePayPalCardFieldsSession(),
                }),
                {
                    wrapper: TestProvider,
                },
            );

            act(() => {
                result.current.session.setCardFieldsSessionType(
                    CARD_FIELDS_SESSION_TYPES.ONE_TIME_PAYMENT,
                );
            });

            expect(
                mockCardFieldsOneTimePaymentSession.update,
            ).toHaveBeenCalledTimes(1);

            // Clear mock to track new calls
            (
                mockCardFieldsOneTimePaymentSession.update as jest.Mock
            ).mockClear();

            // Re-render multiple times with the same amount value (but new object reference)
            rerender();
            rerender();
            rerender();

            // update() should not be called again due to useDeepCompareMemoize
            expect(
                mockCardFieldsOneTimePaymentSession.update,
            ).not.toHaveBeenCalled();
        });
    });

    describe("update configuration", () => {
        test("should call update when amount prop is provided", () => {
            const amount = { currencyCode: "USD", value: "100.00" };

            const { result } = renderHook(
                () => ({
                    status: usePayPalCardFields(),
                    session: usePayPalCardFieldsSession(),
                }),
                {
                    wrapper: ({ children }) => (
                        <PayPalCardFieldsProvider amount={amount}>
                            {children}
                        </PayPalCardFieldsProvider>
                    ),
                },
            );

            act(() => {
                result.current.session.setCardFieldsSessionType(
                    CARD_FIELDS_SESSION_TYPES.ONE_TIME_PAYMENT,
                );
            });

            expect(
                mockCardFieldsOneTimePaymentSession.update,
            ).toHaveBeenCalledWith({
                amount,
            });
        });

        test("should call update when isCobrandedEligible prop is provided", () => {
            const { result } = renderHook(
                () => ({
                    status: usePayPalCardFields(),
                    session: usePayPalCardFieldsSession(),
                }),
                {
                    wrapper: ({ children }) => (
                        <PayPalCardFieldsProvider isCobrandedEligible={true}>
                            {children}
                        </PayPalCardFieldsProvider>
                    ),
                },
            );

            act(() => {
                result.current.session.setCardFieldsSessionType(
                    CARD_FIELDS_SESSION_TYPES.ONE_TIME_PAYMENT,
                );
            });

            expect(
                mockCardFieldsOneTimePaymentSession.update,
            ).toHaveBeenCalledWith({
                isCobrandedEligible: true,
            });
        });

        test("should call update with both amount and isCobrandedEligible", () => {
            const amount = { currencyCode: "EUR", value: "50.00" };

            const { result } = renderHook(
                () => ({
                    status: usePayPalCardFields(),
                    session: usePayPalCardFieldsSession(),
                }),
                {
                    wrapper: ({ children }) => (
                        <PayPalCardFieldsProvider
                            amount={amount}
                            isCobrandedEligible={false}
                        >
                            {children}
                        </PayPalCardFieldsProvider>
                    ),
                },
            );

            act(() => {
                result.current.session.setCardFieldsSessionType(
                    CARD_FIELDS_SESSION_TYPES.SAVE_PAYMENT,
                );
            });

            expect(
                mockCardFieldsSavePaymentSession.update,
            ).toHaveBeenCalledWith({
                amount,
                isCobrandedEligible: false,
            });
        });

        test("should call update when amount prop changes", () => {
            const initialAmount = { currencyCode: "USD", value: "100.00" };
            const updatedAmount = { currencyCode: "USD", value: "200.00" };

            let currentAmount = initialAmount;

            const { result, rerender } = renderHook(
                () => ({
                    status: usePayPalCardFields(),
                    session: usePayPalCardFieldsSession(),
                }),
                {
                    wrapper: ({ children }) => (
                        <PayPalCardFieldsProvider amount={currentAmount}>
                            {children}
                        </PayPalCardFieldsProvider>
                    ),
                },
            );

            act(() => {
                result.current.session.setCardFieldsSessionType(
                    CARD_FIELDS_SESSION_TYPES.ONE_TIME_PAYMENT,
                );
            });

            expect(
                mockCardFieldsOneTimePaymentSession.update,
            ).toHaveBeenCalledWith({
                amount: initialAmount,
            });

            // Clear previous calls to track new ones
            (
                mockCardFieldsOneTimePaymentSession.update as jest.Mock
            ).mockClear();

            // Update the amount prop with a different value
            currentAmount = updatedAmount;
            rerender();

            // The update should be called with the new amount
            expect(
                mockCardFieldsOneTimePaymentSession.update,
            ).toHaveBeenCalledWith({
                amount: updatedAmount,
            });
            expect(
                mockCardFieldsOneTimePaymentSession.update,
            ).toHaveBeenCalledTimes(1);
        });

        test("should not call update when no update props are provided", () => {
            const { result } = renderHook(
                () => ({
                    status: usePayPalCardFields(),
                    session: usePayPalCardFieldsSession(),
                }),
                {
                    wrapper: ({ children }) => (
                        <PayPalCardFieldsProvider>
                            {children}
                        </PayPalCardFieldsProvider>
                    ),
                },
            );

            act(() => {
                result.current.session.setCardFieldsSessionType(
                    CARD_FIELDS_SESSION_TYPES.ONE_TIME_PAYMENT,
                );
            });

            expect(
                mockCardFieldsOneTimePaymentSession.update,
            ).not.toHaveBeenCalled();
        });

        test("should handle errors when calling update", () => {
            const errorMessage = "Update failed";
            const amount = { currencyCode: "USD", value: "100.00" };

            (
                mockCardFieldsOneTimePaymentSession.update as jest.Mock
            ).mockImplementationOnce(() => {
                throw new Error(errorMessage);
            });

            const { result } = renderHook(
                () => ({
                    status: usePayPalCardFields(),
                    session: usePayPalCardFieldsSession(),
                }),
                {
                    wrapper: ({ children }) => (
                        <PayPalCardFieldsProvider amount={amount}>
                            {children}
                        </PayPalCardFieldsProvider>
                    ),
                },
            );

            act(() => {
                result.current.session.setCardFieldsSessionType(
                    CARD_FIELDS_SESSION_TYPES.ONE_TIME_PAYMENT,
                );
            });

            // The error message will include "Error: " prefix when Error is converted to string
            expect(result.current.status.error).toEqual(
                toError(
                    `Failed to update card fields configuration: Error: ${errorMessage}`,
                ),
            );
            expectCurrentErrorValue(result.current.status.error);
        });
    });

    describe("useProxyProps optimization", () => {
        test("should not call update when amount value is the same (deep compare)", () => {
            const amount = { currencyCode: "USD", value: "100.00" };

            function TestProvider({ children }: { children: React.ReactNode }) {
                const memoizedAmount = useDeepCompareMemoize(amount);
                return (
                    <PayPalCardFieldsProvider amount={memoizedAmount}>
                        {children}
                    </PayPalCardFieldsProvider>
                );
            }

            const { result, rerender } = renderHook(
                () => ({
                    status: usePayPalCardFields(),
                    session: usePayPalCardFieldsSession(),
                }),
                {
                    wrapper: TestProvider,
                },
            );

            act(() => {
                result.current.session.setCardFieldsSessionType(
                    CARD_FIELDS_SESSION_TYPES.ONE_TIME_PAYMENT,
                );
            });

            expect(
                mockCardFieldsOneTimePaymentSession.update,
            ).toHaveBeenCalledTimes(1);

            // Clear mock to track new calls
            (
                mockCardFieldsOneTimePaymentSession.update as jest.Mock
            ).mockClear();

            // Re-render multiple times with the same amount value
            rerender();
            rerender();
            rerender();

            // update() should not be called again due to useDeepCompareMemoize
            expect(
                mockCardFieldsOneTimePaymentSession.update,
            ).not.toHaveBeenCalled();
        });

        test("should not re-register handlers when handler value is the same (deep compare)", () => {
            const handler = jest.fn();

            function TestProvider({ children }: { children: React.ReactNode }) {
                const memoizedHandler = useDeepCompareMemoize(handler);
                return (
                    <PayPalCardFieldsProvider blur={memoizedHandler}>
                        {children}
                    </PayPalCardFieldsProvider>
                );
            }

            const { result, rerender } = renderHook(
                () => ({
                    status: usePayPalCardFields(),
                    session: usePayPalCardFieldsSession(),
                }),
                {
                    wrapper: TestProvider,
                },
            );

            act(() => {
                result.current.session.setCardFieldsSessionType(
                    CARD_FIELDS_SESSION_TYPES.ONE_TIME_PAYMENT,
                );
            });

            const initialCallCount = (
                mockCardFieldsOneTimePaymentSession.on as jest.Mock
            ).mock.calls.length;

            // Re-render multiple times with the same handler value
            rerender();
            rerender();
            rerender();

            // on() should not be called again due to useDeepCompareMemoize
            expect(
                (mockCardFieldsOneTimePaymentSession.on as jest.Mock).mock.calls
                    .length,
            ).toBe(initialCallCount);
        });
    });
});
