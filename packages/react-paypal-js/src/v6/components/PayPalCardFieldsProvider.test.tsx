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
import { toError } from "../utils";

import type {
    CardFieldsOneTimePaymentSession,
    CardFieldsSavePaymentSession,
} from "../types";
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

            const { result } = renderCardFieldsProvider();

            expect(result.current.session.cardFieldsSession).toBeNull();
            expect(result.current.status.cardFieldsError).toBeNull();
            expectCurrentErrorValue(result.current.status.cardFieldsError);
        });

        test("should error if there is no sdkInstance and loading is rejected", () => {
            mockUsePayPal.mockReturnValue({
                sdkInstance: null,
                loadingStatus: INSTANCE_LOADING_STATE.REJECTED,
                eligiblePaymentMethods: null,
                error: null,
            });

            const { result } = renderCardFieldsProvider();

            expect(result.current.session.cardFieldsSession).toBeNull();
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

            const { result, rerender } = renderCardFieldsProvider();

            expect(result.current.session.cardFieldsSession).toBeNull();
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
            expect(result.current.session.cardFieldsSession).toBeNull();
            expect(result.current.status.cardFieldsError).toBeNull();
            expectCurrentErrorValue(result.current.status.cardFieldsError);
        });
    });

    describe("session creation", () => {
        test("should not create a session if sessionType is not set", () => {
            const { result } = renderCardFieldsProvider();

            expect(result.current.session.cardFieldsSession).toBeNull();
            expect(result.current.status.cardFieldsError).toBeNull();
            expectCurrentErrorValue(result.current.status.cardFieldsError);
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
            expect(result.current.status.cardFieldsError).toBeNull();
            expectCurrentErrorValue(result.current.status.cardFieldsError);
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
            expect(result.current.status.cardFieldsError).toBeNull();
            expectCurrentErrorValue(result.current.status.cardFieldsError);
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
            expect(result.current.status.cardFieldsError).toEqual(
                toError(errorMessage),
            );
            expectCurrentErrorValue(result.current.status.cardFieldsError);
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
            expect(result.current.status.cardFieldsError).toBeNull();
            expectCurrentErrorValue(result.current.status.cardFieldsError);
        });
    });

    describe("Context isolation", () => {
        const expectedSessionContextKeys = [
            "cardFieldsSession",
            "setCardFieldsSessionType",
        ] as const satisfies (keyof CardFieldsSessionState)[];
        const expectedStatusContextKeys = [
            "cardFieldsError",
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
});
