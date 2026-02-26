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
        test("should show generic error when no components are available", () => {
            const originalError = new Error("Component missing");

            delete (window as Window & { __paypal_sdk__?: unknown })
                .__paypal_sdk__;

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
            const thrownError = mockSetError.mock.calls[0][0];
            expect(thrownError.message).toBe(
                'Failed to create payment session. This may occur if the required component "paypal-payments" is not included in the SDK components array.',
            );
            expect(thrownError.cause).toBe(originalError);
        });

        test("should show generic error when components array is empty", () => {
            (window as Window & { __paypal_sdk__?: unknown }).__paypal_sdk__ = {
                v6: { components: [] },
            };

            const sessionCreator = jest.fn().mockImplementation(() => {
                throw new Error("Component missing");
            });

            createPaymentSession(
                sessionCreator,
                failedSdkRef,
                mockSdkInstance,
                mockSetError,
                "paypal-payments",
            );

            const thrownError = mockSetError.mock.calls[0][0];
            expect(thrownError.message).toBe(
                'Failed to create payment session. This may occur if the required component "paypal-payments" is not included in the SDK components array.',
            );
        });

        test("should show missing component error with component list", () => {
            (window as Window & { __paypal_sdk__?: unknown }).__paypal_sdk__ = {
                v6: {
                    components: ["venmo-payments", "paypal-subscriptions"],
                },
            };

            const sessionCreator = jest.fn().mockImplementation(() => {
                throw new Error("Component not loaded");
            });

            createPaymentSession(
                sessionCreator,
                failedSdkRef,
                mockSdkInstance,
                mockSetError,
                "paypal-payments",
            );

            const thrownError = mockSetError.mock.calls[0][0];
            expect(thrownError.message).toBe(
                'Failed to create payment session. The required component "paypal-payments" is not loaded. Currently loaded components: [venmo-payments, paypal-subscriptions]. Please add "paypal-payments" to your SDK components array.',
            );
        });

        test("should show different error when component is loaded but fails", () => {
            (window as Window & { __paypal_sdk__?: unknown }).__paypal_sdk__ = {
                v6: {
                    components: ["paypal-payments", "venmo-payments"],
                },
            };

            const sessionCreator = jest.fn().mockImplementation(() => {
                throw new Error("Other error");
            });

            createPaymentSession(
                sessionCreator,
                failedSdkRef,
                mockSdkInstance,
                mockSetError,
                "paypal-payments",
            );

            const thrownError = mockSetError.mock.calls[0][0];
            expect(thrownError.message).toBe(
                'Failed to create payment session. The component "paypal-payments" appears to be loaded but the session failed to create.',
            );
        });

        test("should extract component names from various object properties and formats", () => {
            (window as Window & { __paypal_sdk__?: unknown }).__paypal_sdk__ = {
                v6: {
                    components: [
                        "string-component",
                        { componentName: "object-component" },
                        { name: "fallback-name" },
                        { id: "fallback-id" },
                        { type: "fallback-type" },
                        { someOtherProperty: "value" },
                        123,
                    ],
                },
            };

            const sessionCreator = jest.fn().mockImplementation(() => {
                throw new Error("Component not loaded");
            });

            createPaymentSession(
                sessionCreator,
                failedSdkRef,
                mockSdkInstance,
                mockSetError,
                "paypal-payments",
            );

            const thrownError = mockSetError.mock.calls[0][0];
            expect(thrownError.message).toContain("string-component");
            expect(thrownError.message).toContain("object-component");
            expect(thrownError.message).toContain("fallback-name");
            expect(thrownError.message).toContain("fallback-id");
            expect(thrownError.message).toContain("fallback-type");
            expect(thrownError.message).toContain("[Unknown Component]");
            expect(thrownError.message).toContain("123");
        });

        test("should prioritize componentName property over other properties", () => {
            (window as Window & { __paypal_sdk__?: unknown }).__paypal_sdk__ = {
                v6: {
                    components: [
                        {
                            componentName: "correct-name",
                            name: "wrong-name",
                            id: "wrong-id",
                        },
                    ],
                },
            };

            const sessionCreator = jest.fn().mockImplementation(() => {
                throw new Error("Component not loaded");
            });

            createPaymentSession(
                sessionCreator,
                failedSdkRef,
                mockSdkInstance,
                mockSetError,
                "paypal-payments",
            );

            const thrownError = mockSetError.mock.calls[0][0];
            expect(thrownError.message).toContain("correct-name");
            expect(thrownError.message).not.toContain("wrong-name");
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
