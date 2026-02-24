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

    test("should successfully create session when sessionCreator succeeds", () => {
        const mockSession = { start: jest.fn(), destroy: jest.fn() };
        const sessionCreator = jest.fn().mockReturnValue(mockSession);

        const result = createPaymentSession(
            sessionCreator,
            failedSdkRef,
            mockSdkInstance,
            mockSetError,
        );

        expect(result).toBe(mockSession);
        expect(sessionCreator).toHaveBeenCalledTimes(1);
        expect(mockSetError).not.toHaveBeenCalled();
        expect(failedSdkRef.current).toBeNull();
    });

    test("should handle Error object thrown by sessionCreator", () => {
        const error = new Error("Required components not loaded");
        const sessionCreator = jest.fn().mockImplementation(() => {
            throw error;
        });

        const result = createPaymentSession(
            sessionCreator,
            failedSdkRef,
            mockSdkInstance,
            mockSetError,
        );

        expect(result).toBeNull();
        expect(failedSdkRef.current).toBe(mockSdkInstance);

        const thrownError = mockSetError.mock.calls[0][0];
        expect(thrownError.message).toContain("Failed to create");
        expect(thrownError.message).toContain("session");
        expect(thrownError.message).toContain(
            "This may occur if the required components are not included in the SDK components array",
        );
        expect(thrownError.cause).toBe(error);
    });

    test("should handle non-Error string thrown by sessionCreator", () => {
        const sessionCreator = jest.fn().mockImplementation(() => {
            throw "String error message";
        });

        const result = createPaymentSession(
            sessionCreator,
            failedSdkRef,
            mockSdkInstance,
            mockSetError,
        );

        expect(result).toBeNull();
        expect(failedSdkRef.current).toBe(mockSdkInstance);

        const thrownError = mockSetError.mock.calls[0][0];
        expect(thrownError.message).toContain("Failed to create");
        expect(thrownError.message).toContain("session");
        expect(thrownError.cause).toBe("String error message");
    });

    test("should handle null/undefined error thrown by sessionCreator", () => {
        const sessionCreator = jest.fn().mockImplementation(() => {
            throw null;
        });

        const result = createPaymentSession(
            sessionCreator,
            failedSdkRef,
            mockSdkInstance,
            mockSetError,
        );

        expect(result).toBeNull();

        const thrownError = mockSetError.mock.calls[0][0];
        expect(thrownError.message).toContain("Failed to create");
        expect(thrownError.message).toContain("session");
        expect(thrownError.cause).toBeNull();
    });

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
        );

        expect(result).toBe(mockSession);
        expect(successfulCreator).toHaveBeenCalledTimes(1);
    });

    test("should include session type name in error message", () => {
        const sessionCreator = jest.fn().mockImplementation(() => {
            throw new Error("Component missing");
        });

        createPaymentSession(
            sessionCreator,
            failedSdkRef,
            mockSdkInstance,
            mockSetError,
        );

        expect(mockSetError.mock.calls[0][0].message).toContain(
            "Failed to create",
        );
        expect(mockSetError.mock.calls[0][0].message).toContain("session");
    });

    test("should handle object errors thrown by sessionCreator", () => {
        const thrownObject = {
            code: "INVALID_REQUEST",
            details: "Missing parameter",
        };
        const sessionCreator = jest.fn().mockImplementation(() => {
            throw thrownObject;
        });

        const result = createPaymentSession(
            sessionCreator,
            failedSdkRef,
            mockSdkInstance,
            mockSetError,
        );

        expect(result).toBeNull();

        const thrownError = mockSetError.mock.calls[0][0];
        expect(thrownError.message).toContain("Failed to create");
        expect(thrownError.message).toContain("session");
        expect(thrownError.cause).toBe(thrownObject);
    });
});
