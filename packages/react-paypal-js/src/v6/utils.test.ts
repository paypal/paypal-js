import { createPaymentSession } from "./utils";

describe("createPaymentSession", () => {
    let mockSetError: jest.Mock;
    let failedSdkRef: { current: unknown };
    let mockSdkInstance: unknown;

    beforeEach(() => {
        mockSetError = jest.fn();
        failedSdkRef = { current: null };
        mockSdkInstance = { id: "test-sdk-instance" };

        // Clear any existing __paypal_sdk__ from previous tests
        delete (window as Window & { __paypal_sdk__?: unknown }).__paypal_sdk__;
    });

    afterEach(() => {
        jest.clearAllMocks();
        // Cleanup __paypal_sdk__ after each test
        delete (window as Window & { __paypal_sdk__?: unknown }).__paypal_sdk__;
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
        test("should show specific component missing error when component is not loaded", () => {
            // Mock window with loaded components that don't include the required one
            (window as Window & { __paypal_sdk__?: unknown }).__paypal_sdk__ = {
                v6: {
                    components: ["venmo-payments", "paypal-subscriptions"],
                },
            };

            const sessionCreator = jest.fn().mockImplementation(() => {
                throw new Error("Component not loaded");
            });

            const result = createPaymentSession(
                sessionCreator,
                failedSdkRef,
                mockSdkInstance,
                mockSetError,
                "paypal-payments",
            );

            expect(result).toBeNull();

            const thrownError = mockSetError.mock.calls[0][0];
            expect(thrownError.message).toContain(
                "Failed to create payment session",
            );
            expect(thrownError.message).toContain(
                'The required component "paypal-payments" is not loaded',
            );
            expect(thrownError.message).toContain(
                "Currently loaded components: [venmo-payments, paypal-subscriptions]",
            );
            expect(thrownError.message).toContain(
                'Please add "paypal-payments" to your SDK components array',
            );
        });

        test("should show component appears loaded error when component is in loaded list", () => {
            // Mock window with loaded components including the required one
            (window as Window & { __paypal_sdk__?: unknown }).__paypal_sdk__ = {
                v6: {
                    components: ["paypal-payments", "venmo-payments"],
                },
            };

            const sessionCreator = jest.fn().mockImplementation(() => {
                throw new Error("Other error");
            });

            const result = createPaymentSession(
                sessionCreator,
                failedSdkRef,
                mockSdkInstance,
                mockSetError,
                "paypal-payments",
            );

            expect(result).toBeNull();

            const thrownError = mockSetError.mock.calls[0][0];
            expect(thrownError.message).toContain(
                'The component "paypal-payments" appears to be loaded but the session failed to create',
            );
        });

        test("should show generic component error when component is provided but no loaded components info", () => {
            // Ensure no __paypal_sdk__
            delete (window as Window & { __paypal_sdk__?: unknown })
                .__paypal_sdk__;

            const sessionCreator = jest.fn().mockImplementation(() => {
                throw new Error("Component missing");
            });

            const result = createPaymentSession(
                sessionCreator,
                failedSdkRef,
                mockSdkInstance,
                mockSetError,
                "paypal-payments",
            );

            expect(result).toBeNull();

            const thrownError = mockSetError.mock.calls[0][0];
            expect(thrownError.message).toContain(
                'This may occur if the required component "paypal-payments" is not included in the SDK components array',
            );
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
