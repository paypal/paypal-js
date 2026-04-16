import { renderHook, act } from "@testing-library/react-hooks";

import { expectCurrentErrorValue } from "./useErrorTestUtil";
import { useApplePayOneTimePaymentSession } from "./useApplePayOneTimePaymentSession";
import {
    mockPayPalContext,
    mockPayPalRejected,
    mockPayPalPending,
} from "./usePayPalTestUtils";
import { useProxyProps } from "../utils";

import type { UseApplePayOneTimePaymentSessionProps } from "./useApplePayOneTimePaymentSession";
import type { ApplePayOneTimePaymentSession, ApplePayConfig } from "../types";

jest.mock("./usePayPal");

jest.mock("../utils", () => ({
    ...jest.requireActual("../utils"),
    useProxyProps: jest.fn(),
}));

const mockUseProxyProps = useProxyProps as jest.MockedFunction<
    typeof useProxyProps
>;

// Mock Apple Pay Session
let capturedApplePaySession: MockApplePaySession | null = null;

class MockApplePaySession {
    static STATUS_SUCCESS = 0;
    static STATUS_FAILURE = 1;
    static canMakePayments = jest.fn().mockReturnValue(true);

    onvalidatemerchant: ((event: { validationURL: string }) => void) | null =
        null;
    onpaymentmethodselected: (() => void) | null = null;
    onpaymentauthorized:
        | ((event: {
              payment: {
                  token: unknown;
                  billingContact: unknown;
                  shippingContact?: unknown;
              };
          }) => void)
        | null = null;
    oncancel: (() => void) | null = null;

    completeMerchantValidation = jest.fn();
    completePaymentMethodSelection = jest.fn();
    completePayment = jest.fn();
    begin = jest.fn();
    abort = jest.fn();

    constructor(
        public version: number,
        public paymentRequest: unknown,
    ) {
        // Capture the instance created by the hook
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        capturedApplePaySession = this;
    }
}

const createMockApplePaySession = (): ApplePayOneTimePaymentSession => ({
    formatConfigForPaymentRequest: jest.fn().mockReturnValue({
        merchantCapabilities: ["supports3DS"],
        supportedNetworks: ["visa", "masterCard"],
    }),
    validateMerchant: jest.fn().mockResolvedValue({
        merchantSession: {
            epochTimestamp: 1234567890,
            expiresAt: 1234567890,
            merchantSessionIdentifier: "test-session-id",
            nonce: "test-nonce",
            merchantIdentifier: "test-merchant-id",
            domainName: "example.com",
            displayName: "Test Store",
            signature: "test-signature",
            operationalAnalyticsIdentifier: "test-analytics-id",
            retries: 0,
            pspId: "test-psp-id",
        },
    }),
    confirmOrder: jest.fn().mockResolvedValue({
        approveApplePayPayment: {
            id: "test-payment-id",
            status: "APPROVED",
            payment_source: {
                apple_pay: {
                    name: "Test User",
                    card: {},
                },
            },
        },
    }),
});

const createMockSdkInstance = (
    applePaySession = createMockApplePaySession(),
) => ({
    createApplePayOneTimePaymentSession: jest
        .fn()
        .mockReturnValue(applePaySession),
});

const mockApplePayConfig: ApplePayConfig = {
    merchantCapabilities: ["supports3DS"],
    supportedNetworks: ["visa", "masterCard"],
    isEligible: true,
    tokenNotificationURL: "https://example.com/notify",
};

describe("useApplePayOneTimePaymentSession", () => {
    let mockApplePaySession: ApplePayOneTimePaymentSession;
    let mockSdkInstance: ReturnType<typeof createMockSdkInstance>;
    let defaultProps: UseApplePayOneTimePaymentSessionProps;

    beforeEach(() => {
        mockUseProxyProps.mockImplementation((callbacks) => callbacks);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (global.window as any).ApplePaySession = MockApplePaySession;
        Object.defineProperty(window, "location", {
            value: { ...window.location, protocol: "https:" },
            writable: true,
        });

        mockApplePaySession = createMockApplePaySession();
        mockSdkInstance = createMockSdkInstance(mockApplePaySession);

        mockPayPalContext({ sdkInstance: mockSdkInstance });

        // Reset captured session
        capturedApplePaySession = null;

        defaultProps = {
            applePayConfig: mockApplePayConfig,
            paymentRequest: {
                countryCode: "US",
                currencyCode: "USD",
                total: {
                    label: "Test Store",
                    amount: "100.00",
                    type: "final",
                },
            },
            applePaySessionVersion: 4,
            createOrder: jest.fn().mockResolvedValue({ orderId: "ORDER-123" }),
            onApprove: jest.fn(),
            onCancel: jest.fn(),
            onError: jest.fn(),
        };

        // Reset ApplePaySession mocks
        MockApplePaySession.canMakePayments = jest.fn().mockReturnValue(true);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("initialization", () => {
        test("should not create session when no SDK instance is available", () => {
            mockPayPalRejected();

            const {
                result: {
                    current: { error },
                },
            } = renderHook(() =>
                useApplePayOneTimePaymentSession(defaultProps),
            );

            expectCurrentErrorValue(error);

            expect(error).toEqual(new Error("no sdk instance available"));
            expect(
                mockSdkInstance.createApplePayOneTimePaymentSession,
            ).not.toHaveBeenCalled();
        });

        test.each([
            {
                description: "Error object",
                thrownError: new Error("Required components not loaded in SDK"),
            },
            {
                description: "non-Error string",
                thrownError: "String error message",
            },
        ])(
            "should handle $description thrown by createApplePayOneTimePaymentSession",
            ({ thrownError }) => {
                const mockSdkInstanceWithError = {
                    createApplePayOneTimePaymentSession: jest
                        .fn()
                        .mockImplementation(() => {
                            throw thrownError;
                        }),
                };

                mockPayPalContext({ sdkInstance: mockSdkInstanceWithError });

                const {
                    result: {
                        current: { error },
                    },
                } = renderHook(() =>
                    useApplePayOneTimePaymentSession(defaultProps),
                );

                expectCurrentErrorValue(error);

                expect(
                    mockSdkInstanceWithError.createApplePayOneTimePaymentSession,
                ).toHaveBeenCalledTimes(1);
            },
        );

        test("should create session successfully with valid SDK instance", () => {
            const {
                result: {
                    current: { error },
                },
            } = renderHook(() =>
                useApplePayOneTimePaymentSession(defaultProps),
            );

            expect(error).toBeNull();
            expect(
                mockSdkInstance.createApplePayOneTimePaymentSession,
            ).toHaveBeenCalledTimes(1);
        });

        test("should set isPending to true when SDK is loading", () => {
            mockPayPalPending();

            const {
                result: {
                    current: { isPending, error },
                },
            } = renderHook(() =>
                useApplePayOneTimePaymentSession(defaultProps),
            );

            expect(isPending).toBe(true);
            expect(error).toBeNull();
        });

        test("should set isPending to false when SDK is ready", () => {
            const {
                result: {
                    current: { isPending },
                },
            } = renderHook(() =>
                useApplePayOneTimePaymentSession(defaultProps),
            );

            expect(isPending).toBe(false);
        });
    });

    describe("handleClick - payment flow", () => {
        test("should pass applePaySessionVersion to native ApplePaySession constructor", async () => {
            const { result } = renderHook(() =>
                useApplePayOneTimePaymentSession(defaultProps),
            );

            await act(async () => {
                await result.current.handleClick();
            });

            expect(
                mockApplePaySession.formatConfigForPaymentRequest,
            ).toHaveBeenCalledWith(mockApplePayConfig);
            expect(capturedApplePaySession!.version).toBe(4);
        });

        test("should pass custom applePaySessionVersion to native ApplePaySession constructor", async () => {
            const { result } = renderHook(() =>
                useApplePayOneTimePaymentSession({
                    ...defaultProps,
                    applePaySessionVersion: 14,
                }),
            );

            await act(async () => {
                await result.current.handleClick();
            });

            expect(capturedApplePaySession!.version).toBe(14);
        });

        test("should handle payment authorization, confirm order, and call onApprove", async () => {
            const { result } = renderHook(() =>
                useApplePayOneTimePaymentSession(defaultProps),
            );

            await act(async () => {
                await result.current.handleClick();
            });

            expect(capturedApplePaySession).not.toBeNull();
            const mockPayment = {
                token: { paymentData: {} },
                billingContact: { givenName: "John" },
                shippingContact: { givenName: "Jane" },
            };

            await act(async () => {
                await capturedApplePaySession!.onpaymentauthorized?.({
                    payment: mockPayment,
                });
            });

            expect(defaultProps.createOrder).toHaveBeenCalled();
            expect(mockApplePaySession.confirmOrder).toHaveBeenCalled();
            expect(
                capturedApplePaySession!.completePayment,
            ).toHaveBeenCalledWith({
                status: MockApplePaySession.STATUS_SUCCESS,
            });
            expect(defaultProps.onApprove).toHaveBeenCalled();
        });

        test("should handle payment method selection", async () => {
            const { result } = renderHook(() =>
                useApplePayOneTimePaymentSession(defaultProps),
            );

            await act(async () => {
                await result.current.handleClick();
            });

            expect(capturedApplePaySession).not.toBeNull();
            act(() => {
                capturedApplePaySession!.onpaymentmethodselected?.();
            });

            expect(
                capturedApplePaySession!.completePaymentMethodSelection,
            ).toHaveBeenCalledWith({
                newTotal: defaultProps.paymentRequest.total,
            });
        });

        test("should pass displayName and domainName to validateMerchant when provided", async () => {
            const props = {
                ...defaultProps,
                displayName: "My Store",
                domainName: "example.com",
            };

            const { result } = renderHook(() =>
                useApplePayOneTimePaymentSession(props),
            );

            await act(async () => {
                await result.current.handleClick();
            });

            expect(capturedApplePaySession).not.toBeNull();
            await act(async () => {
                await capturedApplePaySession!.onvalidatemerchant?.({
                    validationURL: "https://apple.com/validate",
                });
            });

            expect(mockApplePaySession.validateMerchant).toHaveBeenCalledWith({
                validationUrl: "https://apple.com/validate",
                displayName: "My Store",
                domainName: "example.com",
            });
        });

        test("should not pass displayName and domainName when not provided", async () => {
            const { result } = renderHook(() =>
                useApplePayOneTimePaymentSession(defaultProps),
            );

            await act(async () => {
                await result.current.handleClick();
            });

            expect(capturedApplePaySession).not.toBeNull();
            await act(async () => {
                await capturedApplePaySession!.onvalidatemerchant?.({
                    validationURL: "https://apple.com/validate",
                });
            });

            expect(mockApplePaySession.validateMerchant).toHaveBeenCalledWith({
                validationUrl: "https://apple.com/validate",
            });
        });

        test("should error when Apple Pay is not available", async () => {
            MockApplePaySession.canMakePayments = jest
                .fn()
                .mockReturnValue(false);

            const { result } = renderHook(() =>
                useApplePayOneTimePaymentSession(defaultProps),
            );

            await act(async () => {
                await result.current.handleClick();
            });

            expect(result.current.error?.message).toBe(
                "Apple Pay is not available",
            );
        });

        test("should error when not on HTTPS", async () => {
            const originalProtocol = window.location.protocol;
            Object.defineProperty(window, "location", {
                value: { ...window.location, protocol: "http:" },
                writable: true,
            });

            const { result } = renderHook(() =>
                useApplePayOneTimePaymentSession(defaultProps),
            );

            await act(async () => {
                await result.current.handleClick();
            });

            expect(result.current.error?.message).toBe(
                "Apple Pay requires a secure (HTTPS) connection",
            );

            // Restore
            Object.defineProperty(window, "location", {
                value: { ...window.location, protocol: originalProtocol },
                writable: true,
            });
        });

        test("should error when session is not available", async () => {
            mockPayPalRejected();

            const { result } = renderHook(() =>
                useApplePayOneTimePaymentSession(defaultProps),
            );

            await act(async () => {
                await result.current.handleClick();
            });

            expect(result.current.error?.message).toBe(
                "Apple Pay session not available",
            );
        });
    });

    describe("error handling", () => {
        test.each([
            {
                description: "Error object",
                rejectedValue: new Error("Validation failed"),
                expectedMessage: "Validation failed",
            },
            {
                description: "non-Error string (normalized via toError)",
                rejectedValue: "string error",
                expectedMessage: "string error",
            },
        ])(
            "should handle merchant validation $description and abort session",
            async ({ rejectedValue, expectedMessage }) => {
                mockApplePaySession.validateMerchant = jest
                    .fn()
                    .mockRejectedValue(rejectedValue);

                const { result } = renderHook(() =>
                    useApplePayOneTimePaymentSession(defaultProps),
                );

                await act(async () => {
                    await result.current.handleClick();
                });

                expect(capturedApplePaySession).not.toBeNull();
                await act(async () => {
                    await capturedApplePaySession!.onvalidatemerchant?.({
                        validationURL: "https://apple.com/validate",
                    });
                });

                expect(result.current.error).toBeInstanceOf(Error);
                expect(result.current.error?.message).toBe(expectedMessage);
                expect(defaultProps.onError).toHaveBeenCalled();
                expect(capturedApplePaySession!.abort).toHaveBeenCalled();
            },
        );

        test("should handle order confirmation errors with STATUS_FAILURE", async () => {
            const confirmError = new Error("Confirmation failed");
            mockApplePaySession.confirmOrder = jest
                .fn()
                .mockRejectedValue(confirmError);

            const { result } = renderHook(() =>
                useApplePayOneTimePaymentSession(defaultProps),
            );

            await act(async () => {
                await result.current.handleClick();
            });

            expect(capturedApplePaySession).not.toBeNull();
            await act(async () => {
                await capturedApplePaySession!.onpaymentauthorized?.({
                    payment: {
                        token: {},
                        billingContact: {},
                    },
                });
            });

            expect(result.current.error).toEqual(confirmError);
            expect(defaultProps.onError).toHaveBeenCalledWith(confirmError);
            expect(
                capturedApplePaySession!.completePayment,
            ).toHaveBeenCalledWith({
                status: MockApplePaySession.STATUS_FAILURE,
            });
        });

        test("should clear error when SDK instance becomes available", () => {
            const { rerender, result } = renderHook(() =>
                useApplePayOneTimePaymentSession(defaultProps),
            );

            // Initially has SDK
            expect(result.current.error).toBeNull();

            // Simulate SDK becoming unavailable
            mockPayPalRejected();
            rerender();

            expect(result.current.error).not.toBeNull();

            // SDK becomes available again
            mockPayPalContext({ sdkInstance: mockSdkInstance });
            rerender();

            expect(result.current.error).toBeNull();
        });
    });

    describe("handleCancel", () => {
        test("should call onCancel callback when payment is cancelled", async () => {
            const { result } = renderHook(() =>
                useApplePayOneTimePaymentSession(defaultProps),
            );

            await act(async () => {
                await result.current.handleClick();
            });

            expect(capturedApplePaySession).not.toBeNull();
            act(() => {
                capturedApplePaySession!.oncancel?.();
            });

            expect(defaultProps.onCancel).toHaveBeenCalled();
        });

        test("should abort active Apple Pay session when handleCancel is called", async () => {
            const { result } = renderHook(() =>
                useApplePayOneTimePaymentSession(defaultProps),
            );

            await act(async () => {
                await result.current.handleClick();
            });

            expect(capturedApplePaySession).not.toBeNull();

            act(() => {
                result.current.handleCancel();
            });

            expect(capturedApplePaySession!.abort).toHaveBeenCalled();
        });
    });

    describe("handleDestroy", () => {
        test("should abort session and prevent further clicks after handleDestroy", async () => {
            const { result } = renderHook(() =>
                useApplePayOneTimePaymentSession(defaultProps),
            );

            await act(async () => {
                await result.current.handleClick();
            });

            expect(capturedApplePaySession).not.toBeNull();

            act(() => {
                result.current.handleDestroy();
            });

            expect(capturedApplePaySession!.abort).toHaveBeenCalled();

            // After destroy, handleClick should error because sessionRef is null
            await act(async () => {
                await result.current.handleClick();
            });

            expect(result.current.error?.message).toBe(
                "Apple Pay session not available",
            );
        });
    });

    describe("cleanup", () => {
        test("should not retry session creation after SDK error", () => {
            const mockSdkInstanceWithError = {
                createApplePayOneTimePaymentSession: jest
                    .fn()
                    .mockImplementation(() => {
                        throw new Error("SDK error");
                    }),
            };

            mockPayPalContext({ sdkInstance: mockSdkInstanceWithError });

            const { rerender } = renderHook(() =>
                useApplePayOneTimePaymentSession(defaultProps),
            );

            // First attempt
            expect(
                mockSdkInstanceWithError.createApplePayOneTimePaymentSession,
            ).toHaveBeenCalledTimes(1);

            // Rerender should not trigger another attempt with same failed SDK
            rerender();

            expect(
                mockSdkInstanceWithError.createApplePayOneTimePaymentSession,
            ).toHaveBeenCalledTimes(1);
        });

        test("should retry session creation when SDK instance changes", () => {
            const mockSdkInstanceWithError = {
                createApplePayOneTimePaymentSession: jest
                    .fn()
                    .mockImplementation(() => {
                        throw new Error("SDK error");
                    }),
            };

            mockPayPalContext({ sdkInstance: mockSdkInstanceWithError });

            const { rerender } = renderHook(() =>
                useApplePayOneTimePaymentSession(defaultProps),
            );

            expect(
                mockSdkInstanceWithError.createApplePayOneTimePaymentSession,
            ).toHaveBeenCalledTimes(1);

            // New SDK instance should trigger retry
            const newMockSdkInstance = createMockSdkInstance();
            mockPayPalContext({ sdkInstance: newMockSdkInstance });
            rerender();

            expect(
                newMockSdkInstance.createApplePayOneTimePaymentSession,
            ).toHaveBeenCalledTimes(1);
        });
    });
});
