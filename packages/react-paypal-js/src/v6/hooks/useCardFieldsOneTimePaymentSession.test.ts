import { act, renderHook } from "@testing-library/react-hooks";

import { expectCurrentErrorValue } from "./useErrorTestUtil";
import { useCardFieldsSession } from "./useCardFields";
import { useCardFieldsOneTimePaymentSession } from "./useCardFieldsOneTimePaymentSession";
import { CARD_FIELDS_SESSION_TYPES } from "../components/CardFieldsProvider";
import { toError } from "../utils";

import type {
    CardFieldsOneTimePaymentSession,
    OneTimePaymentFlowResponse,
} from "../types";

jest.mock("./useCardFields");

const mockUseCardFieldsSession = useCardFieldsSession as jest.MockedFunction<
    typeof useCardFieldsSession
>;

const mockOrderId = "test-order-id";

const mockOptions = { billingAddress: { postalCode: "12345" } };

const mockSuccessfulSubmitResponse: OneTimePaymentFlowResponse = {
    data: {
        orderId: mockOrderId,
    },
    state: "succeeded",
};

// Mock Factories
const createMockCardFieldsOneTimePaymentSession = (
    overrides?: Partial<CardFieldsOneTimePaymentSession>,
): CardFieldsOneTimePaymentSession => ({
    submit: jest.fn().mockResolvedValue(undefined),
    on: jest.fn(),
    update: jest.fn(),
    createCardFieldsComponent: jest.fn(),
    ...overrides,
});

describe("useCardFieldsOneTimePaymentSession", () => {
    let mockCardFieldsOneTimePaymentSession: CardFieldsOneTimePaymentSession;

    beforeEach(() => {
        mockCardFieldsOneTimePaymentSession =
            createMockCardFieldsOneTimePaymentSession({
                submit: jest
                    .fn()
                    .mockResolvedValue(mockSuccessfulSubmitResponse),
            });

        mockUseCardFieldsSession.mockReturnValue({
            cardFieldsSession: mockCardFieldsOneTimePaymentSession,
            cardFieldsSessionType: CARD_FIELDS_SESSION_TYPES.ONE_TIME_PAYMENT,
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("submit", () => {
        test("should call the session's submit method with correct arguments", async () => {
            const { result } = renderHook(() =>
                useCardFieldsOneTimePaymentSession(),
            );

            await act(async () => {
                await result.current.submit(mockOrderId, mockOptions);
            });

            expect(
                mockCardFieldsOneTimePaymentSession.submit,
            ).toHaveBeenCalledWith(mockOrderId, mockOptions);
        });

        test("should update submitResponse with the session's submit response", async () => {
            const { result } = renderHook(() =>
                useCardFieldsOneTimePaymentSession(),
            );

            await act(async () => {
                await result.current.submit(mockOrderId, mockOptions);
            });

            expect(result.current.submitResponse).toEqual(
                mockSuccessfulSubmitResponse,
            );
            expect(result.current.error).toBeNull();
            expectCurrentErrorValue(null);
        });

        test("should set error when session type is invalid", () => {
            mockUseCardFieldsSession.mockReturnValueOnce({
                cardFieldsSession: mockCardFieldsOneTimePaymentSession,
                cardFieldsSessionType: CARD_FIELDS_SESSION_TYPES.SAVE_PAYMENT,
            });

            const { result } = renderHook(() =>
                useCardFieldsOneTimePaymentSession(),
            );

            act(() => {
                result.current.submit(mockOrderId, mockOptions);
            });

            const expectedError = toError(
                `Invalid session type: expected ${CARD_FIELDS_SESSION_TYPES.ONE_TIME_PAYMENT}, got "${CARD_FIELDS_SESSION_TYPES.SAVE_PAYMENT}"`,
            );

            expect(result.current.submitResponse).toBeNull();
            expect(result.current.error).toEqual(expectedError);
            expectCurrentErrorValue(result.current.error);
        });

        test("should set error when session is not available", () => {
            mockUseCardFieldsSession.mockReturnValueOnce({
                cardFieldsSession: null,
                cardFieldsSessionType:
                    CARD_FIELDS_SESSION_TYPES.ONE_TIME_PAYMENT,
            });

            const { result } = renderHook(() =>
                useCardFieldsOneTimePaymentSession(),
            );

            act(() => {
                result.current.submit(mockOrderId, mockOptions);
            });

            const expectedError = toError("CardFields session not available");

            expect(result.current.submitResponse).toBeNull();
            expect(result.current.error).toEqual(expectedError);
            expectCurrentErrorValue(result.current.error);
        });

        test("should set error when session's submit rejects", async () => {
            const submitRejectError = new Error("Submit failed");
            const newMockCardFieldsOneTimePaymentSession =
                createMockCardFieldsOneTimePaymentSession({
                    submit: jest.fn().mockRejectedValue(submitRejectError),
                });

            mockUseCardFieldsSession.mockReturnValueOnce({
                cardFieldsSession: newMockCardFieldsOneTimePaymentSession,
                cardFieldsSessionType:
                    CARD_FIELDS_SESSION_TYPES.ONE_TIME_PAYMENT,
            });

            const { result } = renderHook(() =>
                useCardFieldsOneTimePaymentSession(),
            );

            await act(async () => {
                await result.current.submit(mockOrderId, mockOptions);
            });

            expect(result.current.submitResponse).toBeNull();
            expect(result.current.error).toEqual(submitRejectError);
            expectCurrentErrorValue(result.current.error);
        });

        test("should handle orderId promise", async () => {
            const { result } = renderHook(() =>
                useCardFieldsOneTimePaymentSession(),
            );

            const orderIdPromise = Promise.resolve(mockOrderId);

            await act(async () => {
                result.current.submit(orderIdPromise, mockOptions);
            });

            expect(
                mockCardFieldsOneTimePaymentSession.submit,
            ).toHaveBeenCalledWith(mockOrderId, mockOptions);
            expect(result.current.submitResponse).toEqual(
                mockSuccessfulSubmitResponse,
            );
            expect(result.current.error).toBeNull();
            expectCurrentErrorValue(null);
        });

        test("should set error when orderId promise rejects", async () => {
            const { result } = renderHook(() =>
                useCardFieldsOneTimePaymentSession(),
            );

            const orderIdError = new Error("Order ID fetch failed");
            const orderIdPromise = Promise.reject(orderIdError);

            await act(async () => {
                await result.current.submit(orderIdPromise, mockOptions);
            });

            expect(result.current.submitResponse).toBeNull();
            expect(result.current.error).toEqual(orderIdError);
            expectCurrentErrorValue(result.current.error);
        });
    });
});
