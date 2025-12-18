import { act, renderHook } from "@testing-library/react-hooks";

import { expectCurrentErrorValue } from "./useErrorTestUtil";
import { usePayPalCardFieldsSession } from "./usePayPalCardFields";
import { usePayPalCardFieldsSavePaymentSession } from "./usePayPalCardFieldsSavePaymentSession";
import { CARD_FIELDS_SESSION_TYPES } from "../components/PayPalCardFieldsProvider";
import { toError } from "../utils";

import type {
    CardFieldsSavePaymentSession,
    SavePaymentFlowResponse,
} from "../types";

jest.mock("./usePayPalCardFields");

const mockUsePayPalCardFieldsSession =
    usePayPalCardFieldsSession as jest.MockedFunction<
        typeof usePayPalCardFieldsSession
    >;

const mockVaultSetupToken = "test-vault-setup-token";

const mockOptions = { billingAddress: { countryCode: "US" } };

const mockSuccessfulSubmitResponse: SavePaymentFlowResponse = {
    data: {
        vaultSetupToken: mockVaultSetupToken,
    },
    state: "succeeded",
};

const mockSetCardFieldsSessionType = jest.fn();

// Mock Factories
const createMockCardFieldsSavePaymentSession = (
    overrides?: Partial<CardFieldsSavePaymentSession>,
): CardFieldsSavePaymentSession => ({
    submit: jest.fn().mockResolvedValue(undefined),
    on: jest.fn(),
    update: jest.fn(),
    createCardFieldsComponent: jest.fn(),
    ...overrides,
});

describe("usePayPalCardFieldsSavePaymentSession", () => {
    let mockCardFieldsSavePaymentSession: CardFieldsSavePaymentSession;

    beforeEach(() => {
        mockCardFieldsSavePaymentSession =
            createMockCardFieldsSavePaymentSession({
                submit: jest
                    .fn()
                    .mockResolvedValue(mockSuccessfulSubmitResponse),
            });

        mockUsePayPalCardFieldsSession.mockReturnValue({
            cardFieldsSession: mockCardFieldsSavePaymentSession,
            setCardFieldsSessionType: mockSetCardFieldsSessionType,
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test("should call setCardFieldsSessionType with 'save-payment' value on mount", () => {
        renderHook(() => usePayPalCardFieldsSavePaymentSession());

        expect(mockSetCardFieldsSessionType).toHaveBeenCalledTimes(1);
        expect(mockSetCardFieldsSessionType).toHaveBeenCalledWith(
            CARD_FIELDS_SESSION_TYPES.SAVE_PAYMENT,
        );
    });

    describe("submit", () => {
        test("should call the session's submit method with correct arguments", async () => {
            const { result } = renderHook(() =>
                usePayPalCardFieldsSavePaymentSession(),
            );

            await act(async () => {
                await result.current.submit(mockVaultSetupToken, mockOptions);
            });

            expect(
                mockCardFieldsSavePaymentSession.submit,
            ).toHaveBeenCalledWith(mockVaultSetupToken, mockOptions);
        });

        test("should update submitResponse with the session's submit response", async () => {
            const { result } = renderHook(() =>
                usePayPalCardFieldsSavePaymentSession(),
            );

            await act(async () => {
                await result.current.submit(mockVaultSetupToken, mockOptions);
            });

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
                usePayPalCardFieldsSavePaymentSession(),
            );

            await act(async () => {
                await result.current.submit(mockVaultSetupToken, mockOptions);
            });

            const expectedError = toError(
                "Submit error: CardFields session not available",
            );

            expect(result.current.submitResponse).toBeNull();
            expect(result.current.error).toEqual(expectedError);
            expectCurrentErrorValue(result.current.error);
        });

        test("should set error when session's submit rejects", async () => {
            const submitRejectError = new Error("Submit failed");
            const newMockCardFieldsSavePaymentSession =
                createMockCardFieldsSavePaymentSession({
                    submit: jest.fn().mockRejectedValue(submitRejectError),
                });

            mockUsePayPalCardFieldsSession.mockReturnValueOnce({
                cardFieldsSession: newMockCardFieldsSavePaymentSession,
                setCardFieldsSessionType: mockSetCardFieldsSessionType,
            });

            const { result } = renderHook(() =>
                usePayPalCardFieldsSavePaymentSession(),
            );

            await act(async () => {
                await result.current.submit(mockVaultSetupToken, mockOptions);
            });

            expect(result.current.submitResponse).toBeNull();
            expect(result.current.error).toEqual(submitRejectError);
            expectCurrentErrorValue(result.current.error);
        });

        test("should handle vaultSetupToken being a promise", async () => {
            const { result } = renderHook(() =>
                usePayPalCardFieldsSavePaymentSession(),
            );

            const vaultSetupTokenPromise = Promise.resolve(mockVaultSetupToken);

            await act(async () => {
                await result.current.submit(
                    vaultSetupTokenPromise,
                    mockOptions,
                );
            });

            expect(
                mockCardFieldsSavePaymentSession.submit,
            ).toHaveBeenCalledWith(mockVaultSetupToken, mockOptions);
            expect(result.current.submitResponse).toEqual(
                mockSuccessfulSubmitResponse,
            );
            expect(result.current.error).toBeNull();
            expectCurrentErrorValue(result.current.error);
        });

        test("should set error when vaultSetupToken promise rejects", async () => {
            const { result } = renderHook(() =>
                usePayPalCardFieldsSavePaymentSession(),
            );

            const vaultSetupTokenError = new Error("Vault Setup Token failed");
            const vaultSetupTokenPromise = Promise.reject(vaultSetupTokenError);

            await act(async () => {
                await result.current.submit(
                    vaultSetupTokenPromise,
                    mockOptions,
                );
            });

            expect(
                mockCardFieldsSavePaymentSession.submit,
            ).not.toHaveBeenCalled();
            expect(result.current.submitResponse).toBeNull();
            expect(result.current.error).toEqual(vaultSetupTokenError);
            expectCurrentErrorValue(result.current.error);
        });
    });
});
