import React from "react";
import { renderHook } from "@testing-library/react-hooks";

import { usePayPal } from "../hooks/usePayPal";
import { INSTANCE_LOADING_STATE } from "../types";
import { expectCurrentErrorValue } from "../hooks/useErrorTestUtil";
import {
    CARD_FIELDS_SESSION_TYPES,
    CardFieldsProvider,
} from "./CardFieldsProvider";
import { useCardFields, useCardFieldsSession } from "../hooks/useCardFields";
import { toError } from "../utils";

import type {
    CardFieldsOneTimePaymentSession,
    CardFieldsSavePaymentSession,
} from "../types";
import type { CardFieldsSessionType } from "./CardFieldsProvider";
import type {
    CardFieldsSessionState,
    CardFieldsStatusState,
} from "../context/CardFieldsProviderContext";

jest.mock("../hooks/usePayPal");

const mockUsePayPal = usePayPal as jest.MockedFunction<typeof usePayPal>;

// Mock Factories
const createMockOneTimePaymentSession =
    (): CardFieldsOneTimePaymentSession => ({
        createCardFieldsComponent: jest.fn(),
        on: jest.fn(),
        submit: jest.fn(),
        update: jest.fn(),
    });

const createMockSavePaymentSession = (): CardFieldsSavePaymentSession => ({
    createCardFieldsComponent: jest.fn(),
    on: jest.fn(),
    submit: jest.fn(),
    update: jest.fn(),
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
function renderCardFieldsProvider({
    sessionType,
}: {
    sessionType: CardFieldsSessionType;
}) {
    return renderHook(
        () => ({
            status: useCardFields(),
            session: useCardFieldsSession(),
        }),
        {
            initialProps: { sessionType },
            wrapper: ({ children, sessionType }) => (
                <CardFieldsProvider sessionType={sessionType}>
                    {children}
                </CardFieldsProvider>
            ),
        },
    );
}

describe("CardFieldsProvider", () => {
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
            });

            const { result } = renderCardFieldsProvider({
                sessionType: CARD_FIELDS_SESSION_TYPES.ONE_TIME_PAYMENT,
            });

            expect(result.current.session.cardFieldsSession).toBeNull();
            expect(result.current.session.cardFieldsSessionType).toBe(
                CARD_FIELDS_SESSION_TYPES.ONE_TIME_PAYMENT,
            );
            expect(result.current.status.cardFieldsError).toBeNull();
            expectCurrentErrorValue(null);
        });

        test("should error if there is no sdkInstance and loading is rejected", () => {
            mockUsePayPal.mockReturnValue({
                sdkInstance: null,
                loadingStatus: INSTANCE_LOADING_STATE.REJECTED,
                eligiblePaymentMethods: null,
                error: null,
            });

            const { result } = renderCardFieldsProvider({
                sessionType: CARD_FIELDS_SESSION_TYPES.ONE_TIME_PAYMENT,
            });

            expect(result.current.session.cardFieldsSession).toBeNull();
            expect(result.current.session.cardFieldsSessionType).toBe(
                CARD_FIELDS_SESSION_TYPES.ONE_TIME_PAYMENT,
            );
            expect(result.current.status.cardFieldsError).toEqual(
                toError("no sdk instance available"),
            );
            expectCurrentErrorValue(result.current.status.cardFieldsError);
        });

        test("should clear any sdkInstance related errors if the sdkInstance becomes available", () => {
            // First render: no sdkInstance and not in PENDING state, should error
            mockUsePayPal.mockReturnValue({
                sdkInstance: null,
                loadingStatus: INSTANCE_LOADING_STATE.REJECTED,
                eligiblePaymentMethods: null,
                error: null,
            });

            const { result, rerender } = renderCardFieldsProvider({
                sessionType: CARD_FIELDS_SESSION_TYPES.ONE_TIME_PAYMENT,
            });

            expect(result.current.session.cardFieldsSession).toBeNull();
            expect(result.current.session.cardFieldsSessionType).toBe(
                CARD_FIELDS_SESSION_TYPES.ONE_TIME_PAYMENT,
            );
            expect(result.current.status.cardFieldsError).toEqual(
                toError("no sdk instance available"),
            );
            expectCurrentErrorValue(result.current.status.cardFieldsError);

            // Second render: sdkInstance becomes available, error should clear
            mockUsePayPal.mockReturnValue({
                // @ts-expect-error mocking sdk instance
                sdkInstance: mockSdkInstance,
                loadingStatus: INSTANCE_LOADING_STATE.RESOLVED,
                eligiblePaymentMethods: null,
                error: null,
            });

            rerender();
            expect(result.current.session.cardFieldsSession).toBe(
                mockCardFieldsOneTimePaymentSession,
            );
            expect(result.current.status.cardFieldsError).toBeNull();
            expectCurrentErrorValue(null);
        });

        test("should handle errors when creating the session", () => {
            const errorMessage = "Failed to create session";

            mockSdkInstance.createCardFieldsOneTimePaymentSession.mockImplementationOnce(
                () => {
                    throw new Error(errorMessage);
                },
            );

            const { result } = renderCardFieldsProvider({
                sessionType: CARD_FIELDS_SESSION_TYPES.ONE_TIME_PAYMENT,
            });

            expect(result.current.session.cardFieldsSession).toBeNull();
            expect(result.current.session.cardFieldsSessionType).toBe(
                CARD_FIELDS_SESSION_TYPES.ONE_TIME_PAYMENT,
            );
            expect(result.current.status.cardFieldsError).toEqual(
                toError(errorMessage),
            );
            expectCurrentErrorValue(result.current.status.cardFieldsError);
        });
    });

    describe("sessionType", () => {
        test.each([
            {
                sessionType: CARD_FIELDS_SESSION_TYPES.ONE_TIME_PAYMENT,
                expectedMethod:
                    "createCardFieldsOneTimePaymentSession" as const,
                unexpectedMethod: "createCardFieldsSavePaymentSession" as const,
            },
            {
                sessionType: CARD_FIELDS_SESSION_TYPES.SAVE_PAYMENT,
                expectedMethod: "createCardFieldsSavePaymentSession" as const,
                unexpectedMethod:
                    "createCardFieldsOneTimePaymentSession" as const,
            },
        ])(
            "should call $expectedMethod method when sessionType is $sessionType",
            ({ sessionType, expectedMethod, unexpectedMethod }) => {
                renderCardFieldsProvider({
                    sessionType,
                });

                // Check that the correct create method was called
                expect(mockSdkInstance[expectedMethod]).toHaveBeenCalledTimes(
                    1,
                );
                expect(
                    mockSdkInstance[unexpectedMethod],
                ).not.toHaveBeenCalled();
            },
        );

        test("should be correct session instance when sessionType is 'one-time-payment'", () => {
            const { result } = renderCardFieldsProvider({
                sessionType: CARD_FIELDS_SESSION_TYPES.ONE_TIME_PAYMENT,
            });

            expect(result.current.session.cardFieldsSession).toBe(
                mockCardFieldsOneTimePaymentSession,
            );
            expect(result.current.session.cardFieldsSessionType).toBe(
                CARD_FIELDS_SESSION_TYPES.ONE_TIME_PAYMENT,
            );
            expect(result.current.session.cardFieldsSession).not.toBe(
                mockCardFieldsSavePaymentSession,
            );
        });

        test("should be correct session instance when sessionType is 'save-payment'", () => {
            const { result } = renderCardFieldsProvider({
                sessionType: CARD_FIELDS_SESSION_TYPES.SAVE_PAYMENT,
            });

            expect(result.current.session.cardFieldsSession).toBe(
                mockCardFieldsSavePaymentSession,
            );
            expect(result.current.session.cardFieldsSessionType).toBe(
                CARD_FIELDS_SESSION_TYPES.SAVE_PAYMENT,
            );
            expect(result.current.session.cardFieldsSession).not.toBe(
                mockCardFieldsOneTimePaymentSession,
            );
        });
    });

    describe("session lifecycle", () => {
        test("should update the session when the provider re-runs with a new sdkInstance", () => {
            // Initial render with first mockSdkInstance
            const { result, rerender } = renderCardFieldsProvider({
                sessionType: CARD_FIELDS_SESSION_TYPES.ONE_TIME_PAYMENT,
            });

            expect(result.current.session.cardFieldsSession).toBe(
                mockCardFieldsOneTimePaymentSession,
            );
            expect(result.current.session.cardFieldsSessionType).toBe(
                CARD_FIELDS_SESSION_TYPES.ONE_TIME_PAYMENT,
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
            });

            rerender();
            expect(result.current.session.cardFieldsSessionType).toBe(
                CARD_FIELDS_SESSION_TYPES.ONE_TIME_PAYMENT,
            );
            expect(
                newMockSdkInstance.createCardFieldsOneTimePaymentSession,
            ).toHaveBeenCalledTimes(1);
            expect(
                newMockSdkInstance.createCardFieldsSavePaymentSession,
            ).not.toHaveBeenCalled();
            expect(result.current.session.cardFieldsSession).toBe(
                newMockCardFieldsOneTimePaymentSession,
            );
            expect(result.current.session.cardFieldsSession).not.toBe(
                mockCardFieldsOneTimePaymentSession,
            );
        });

        test("should update the session when the provider re-runs with a new sessionType", () => {
            // Initial render with one-time-payment
            const { result, rerender } = renderCardFieldsProvider({
                sessionType: CARD_FIELDS_SESSION_TYPES.ONE_TIME_PAYMENT,
            });

            expect(result.current.session.cardFieldsSessionType).toBe(
                CARD_FIELDS_SESSION_TYPES.ONE_TIME_PAYMENT,
            );
            expect(result.current.session.cardFieldsSession).toBe(
                mockCardFieldsOneTimePaymentSession,
            );
            expect(result.current.session.cardFieldsSession).not.toBe(
                mockCardFieldsSavePaymentSession,
            );

            // Rerender with save-payment
            rerender({ sessionType: CARD_FIELDS_SESSION_TYPES.SAVE_PAYMENT });

            expect(result.current.session.cardFieldsSessionType).toBe(
                CARD_FIELDS_SESSION_TYPES.SAVE_PAYMENT,
            );
            expect(result.current.session.cardFieldsSession).toBe(
                mockCardFieldsSavePaymentSession,
            );
            expect(result.current.session.cardFieldsSession).not.toBe(
                mockCardFieldsOneTimePaymentSession,
            );
        });
    });

    describe("Context isolation", () => {
        const expectedSessionContextKeys = [
            "cardFieldsSession",
            "cardFieldsSessionType",
        ] as const satisfies (keyof CardFieldsSessionState)[];
        const expectedStatusContextKeys = [
            "cardFieldsError",
        ] as const satisfies (keyof CardFieldsStatusState)[];

        describe("useCardFields", () => {
            test("should only return status context values", () => {
                const { result } = renderCardFieldsProvider({
                    sessionType: CARD_FIELDS_SESSION_TYPES.ONE_TIME_PAYMENT,
                });

                const receivedStatusKeys = Object.keys(result.current.status);
                expect(receivedStatusKeys.sort()).toEqual(
                    [...expectedStatusContextKeys].sort(),
                );
            });

            test("should not return session context values", () => {
                const { result } = renderCardFieldsProvider({
                    sessionType: CARD_FIELDS_SESSION_TYPES.ONE_TIME_PAYMENT,
                });

                const receivedStatusKeys = Object.keys(result.current.status);
                expectedSessionContextKeys.forEach((key) => {
                    expect(receivedStatusKeys).not.toContain(key);
                });
            });
        });

        describe("useCardFieldsSession", () => {
            test("should only return session context values", () => {
                const { result } = renderCardFieldsProvider({
                    sessionType: CARD_FIELDS_SESSION_TYPES.ONE_TIME_PAYMENT,
                });

                const receivedSessionKeys = Object.keys(result.current.session);
                expect(receivedSessionKeys.sort()).toEqual(
                    [...expectedSessionContextKeys].sort(),
                );
            });

            test("should not return status context values", () => {
                const { result } = renderCardFieldsProvider({
                    sessionType: CARD_FIELDS_SESSION_TYPES.ONE_TIME_PAYMENT,
                });

                const receivedSesssionKeys = Object.keys(
                    result.current.session,
                );
                expectedStatusContextKeys.forEach((key) => {
                    expect(receivedSesssionKeys).not.toContain(key);
                });
            });
        });
    });
});
