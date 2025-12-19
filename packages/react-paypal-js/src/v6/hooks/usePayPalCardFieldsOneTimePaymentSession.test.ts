import { act, renderHook } from "@testing-library/react-hooks";

import { expectCurrentErrorValue } from "./useErrorTestUtil";
import { usePayPalCardFieldsSession } from "./usePayPalCardFields";
import { usePayPalCardFieldsOneTimePaymentSession } from "./usePayPalCardFieldsOneTimePaymentSession";
import { CARD_FIELDS_SESSION_TYPES } from "../components/PayPalCardFieldsProvider";
import { toError } from "../utils";

import type {
    CardFieldsOneTimePaymentSession,
    OneTimePaymentFlowResponse,
} from "../types";

jest.mock("./usePayPalCardFields");

const mockUsePayPalCardFieldsSession =
    usePayPalCardFieldsSession as jest.MockedFunction<
        typeof usePayPalCardFieldsSession
    >;

const mockOrderId = "test-order-id";

const mockOptions = { billingAddress: { postalCode: "12345" } };

const mockSuccessfulSubmitResponse: OneTimePaymentFlowResponse = {
    data: {
        orderId: mockOrderId,
    },
    state: "succeeded",
};

const mockSetCardFieldsSessionType = jest.fn();

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

describe("usePayPalCardFieldsOneTimePaymentSession", () => {
    let mockCardFieldsOneTimePaymentSession: CardFieldsOneTimePaymentSession;

    beforeEach(() => {
        mockCardFieldsOneTimePaymentSession =
            createMockCardFieldsOneTimePaymentSession({
                submit: jest
                    .fn()
                    .mockResolvedValue(mockSuccessfulSubmitResponse),
            });

        mockUsePayPalCardFieldsSession.mockReturnValue({
            cardFieldsSession: mockCardFieldsOneTimePaymentSession,
            setCardFieldsSessionType: mockSetCardFieldsSessionType,
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test("should call setCardFieldsSessionType with 'one-time-payment value' on mount", () => {
        renderHook(() => usePayPalCardFieldsOneTimePaymentSession());

        expect(mockSetCardFieldsSessionType).toHaveBeenCalledTimes(1);
        expect(mockSetCardFieldsSessionType).toHaveBeenCalledWith(
            CARD_FIELDS_SESSION_TYPES.ONE_TIME_PAYMENT,
        );
    });

    describe("submit", () => {
        test("should update submitResponse with the session's submit response", async () => {
            const { result } = renderHook(() =>
                usePayPalCardFieldsOneTimePaymentSession(),
            );

            await act(async () => {
                await result.current.submit(mockOrderId, mockOptions);
            });

            expect(
                mockCardFieldsOneTimePaymentSession.submit,
            ).toHaveBeenCalledWith(mockOrderId, mockOptions);
            expect(result.current.submitResponse).toEqual(
                mockSuccessfulSubmitResponse,
            );
            expect(result.current.error).toBeNull();
            expectCurrentErrorValue(result.current.error);
        });

        test("should set error when session is not available", async () => {
            mockUsePayPalCardFieldsSession.mockReturnValueOnce({
                cardFieldsSession: null,
                setCardFieldsSessionType: mockSetCardFieldsSessionType,
            });

            const { result } = renderHook(() =>
                usePayPalCardFieldsOneTimePaymentSession(),
            );

            await act(async () => {
                await result.current.submit(mockOrderId, mockOptions);
            });

            const expectedError = toError(
                "Submit error: CardFields session not available",
            );

            expect(
                mockCardFieldsOneTimePaymentSession.submit,
            ).not.toHaveBeenCalled();
            expect(result.current.submitResponse).toBeNull();
            expect(result.current.error).toEqual(expectedError);
            expectCurrentErrorValue(result.current.error);
        });

        test("should set error when session's submit rejects", async () => {
            const submitRejectError = toError("Submit failed");
            const newMockCardFieldsOneTimePaymentSession =
                createMockCardFieldsOneTimePaymentSession({
                    submit: jest.fn().mockRejectedValue(submitRejectError),
                });

            mockUsePayPalCardFieldsSession.mockReturnValueOnce({
                cardFieldsSession: newMockCardFieldsOneTimePaymentSession,
                setCardFieldsSessionType: mockSetCardFieldsSessionType,
            });

            const { result } = renderHook(() =>
                usePayPalCardFieldsOneTimePaymentSession(),
            );

            await act(async () => {
                await result.current.submit(mockOrderId, mockOptions);
            });

            expect(result.current.submitResponse).toBeNull();
            expect(result.current.error).toEqual(submitRejectError);
            expectCurrentErrorValue(result.current.error);
        });

        test("should handle orderId being a promise", async () => {
            const { result } = renderHook(() =>
                usePayPalCardFieldsOneTimePaymentSession(),
            );

            const orderIdPromise = Promise.resolve(mockOrderId);

            await act(async () => {
                await result.current.submit(orderIdPromise, mockOptions);
            });

            expect(
                mockCardFieldsOneTimePaymentSession.submit,
            ).toHaveBeenCalledWith(mockOrderId, mockOptions);
            expect(result.current.submitResponse).toEqual(
                mockSuccessfulSubmitResponse,
            );
            expect(result.current.error).toBeNull();
            expectCurrentErrorValue(result.current.error);
        });

        test("should set error when orderId promise rejects", async () => {
            const { result } = renderHook(() =>
                usePayPalCardFieldsOneTimePaymentSession(),
            );

            const orderIdError = toError("Order ID fetch failed");
            const orderIdPromise = Promise.reject(orderIdError);

            await act(async () => {
                await result.current.submit(orderIdPromise, mockOptions);
            });

            expect(
                mockCardFieldsOneTimePaymentSession.submit,
            ).not.toHaveBeenCalled();
            expect(result.current.submitResponse).toBeNull();
            expect(result.current.error).toEqual(orderIdError);
            expectCurrentErrorValue(result.current.error);
        });
    });
});
