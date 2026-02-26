import { createPaymentSession } from "./utils";

describe("createPaymentSession", () => {
    let mockSetError: jest.Mock;
    let failedSdkRef: { current: unknown };
    let mockSdkInstance: unknown;

    beforeEach(() => {
        mockSetError = jest.fn();
        failedSdkRef = { current: null };
        mockSdkInstance = { id: "test-sdk-instance" };
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("successful session creation", () => {
        test("should successfully create session when sessionCreator succeeds", () => {
            const mockSession = { start: jest.fn(), destroy: jest.fn() };
            const sessionCreator = jest.fn().mockReturnValue(mockSession);

            const result = createPaymentSession(
                sessionCreator,
                failedSdkRef,
                mockSdkInstance,
                mockSetError,
                "paypal-payments",
            );

            expect(result).toBe(mockSession);
            expect(sessionCreator).toHaveBeenCalledTimes(1);
            expect(mockSetError).not.toHaveBeenCalled();
            expect(failedSdkRef.current).toBeNull();
        });
    });

    describe("error handling with component parameter", () => {
        test("should handle session creation failure with proper error message and error preservation", () => {
            const originalError = new Error("Component missing");
            const sessionCreator = jest.fn().mockImplementation(() => {
                throw originalError;
            });

            const result = createPaymentSession(
                sessionCreator,
                failedSdkRef,
                mockSdkInstance,
                mockSetError,
                "paypal-payments",
            );

            expect(result).toBeNull();
            expect(mockSetError).toHaveBeenCalledTimes(1);

            const thrownError = mockSetError.mock.calls[0][0];
            expect(thrownError).toBeInstanceOf(Error);
            expect(thrownError.message).toBe(
                'Failed to create payment session. This may occur if the required component "paypal-payments" is not included in the SDK components array.',
            );
            expect(thrownError.cause).toBe(originalError);
            expect(failedSdkRef.current).toBe(mockSdkInstance);
        });
    });

    describe("retry prevention logic", () => {
        test("should prevent retry if SDK instance already failed", () => {
            // First call fails
            const sessionCreator = jest.fn().mockImplementation(() => {
                throw new Error("Failed");
            });

            const firstResult = createPaymentSession(
                sessionCreator,
                failedSdkRef,
                mockSdkInstance,
                mockSetError,
                "paypal-payments",
            );

            expect(firstResult).toBeNull();
            expect(sessionCreator).toHaveBeenCalledTimes(1);
            expect(failedSdkRef.current).toBe(mockSdkInstance);

            // Clear mocks for second attempt
            jest.clearAllMocks();

            // Second call with same SDK instance should return null immediately
            const secondResult = createPaymentSession(
                sessionCreator,
                failedSdkRef,
                mockSdkInstance,
                mockSetError,
                "paypal-payments",
            );

            expect(secondResult).toBeNull();
            expect(sessionCreator).not.toHaveBeenCalled();
            expect(mockSetError).not.toHaveBeenCalled();
        });

        test("should allow retry with a new SDK instance after previous failure", () => {
            // First call fails
            const failingCreator = jest.fn().mockImplementation(() => {
                throw new Error("Failed");
            });

            createPaymentSession(
                failingCreator,
                failedSdkRef,
                mockSdkInstance,
                mockSetError,
                "paypal-payments",
            );

            expect(failedSdkRef.current).toBe(mockSdkInstance);

            // New SDK instance
            const newSdkInstance = { id: "new-sdk-instance" };
            const mockSession = { start: jest.fn() };
            const successfulCreator = jest.fn().mockReturnValue(mockSession);

            // Should succeed with new SDK instance
            const result = createPaymentSession(
                successfulCreator,
                failedSdkRef,
                newSdkInstance,
                mockSetError,
                "paypal-payments",
            );

            expect(result).toBe(mockSession);
            expect(successfulCreator).toHaveBeenCalledTimes(1);
        });
    });
});
