import { renderHook, act } from "@testing-library/react-hooks";

import { expectCurrentErrorValue } from "./useErrorTestUtil";
import { usePayPalGuestPaymentSession } from "./usePayPalGuestPaymentSession";
import {
    mockPayPalContext,
    mockPayPalRejected,
    mockPayPalPending,
} from "./usePayPalTestUtils";
import { useProxyProps } from "../utils";
import {
    INSTANCE_LOADING_STATE,
    type PayPalGuestOneTimePaymentSession,
} from "../types";

import type { UsePayPalGuestPaymentSessionProps } from "./usePayPalGuestPaymentSession";

jest.mock("./usePayPal");

jest.mock("../utils", () => ({
    useProxyProps: jest.fn(),
}));

const mockUseProxyProps = useProxyProps as jest.MockedFunction<
    typeof useProxyProps
>;

const createMockPayPalGuestSession = (): PayPalGuestOneTimePaymentSession => ({
    start: jest.fn().mockResolvedValue(undefined),
    cancel: jest.fn(),
    destroy: jest.fn(),
});

const createMockSdkInstance = (
    paypalSession = createMockPayPalGuestSession(),
) => ({
    createPayPalGuestOneTimePaymentSession: jest
        .fn()
        .mockReturnValue(paypalSession),
});

describe("usePayPalGuestPaymentSession", () => {
    let mockPayPalSession: PayPalGuestOneTimePaymentSession;
    let mockSdkInstance: ReturnType<typeof createMockSdkInstance>;

    beforeEach(() => {
        mockUseProxyProps.mockImplementation((callbacks) => callbacks);

        mockPayPalSession = createMockPayPalGuestSession();
        mockSdkInstance = createMockSdkInstance(mockPayPalSession);

        mockPayPalContext({ sdkInstance: mockSdkInstance });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("initialization", () => {
        test("should not create session when no SDK instance is available", () => {
            mockPayPalRejected();

            const props: UsePayPalGuestPaymentSessionProps = {
                orderId: "test-order-id",
                onApprove: jest.fn(),
                onCancel: jest.fn(),
                onError: jest.fn(),
            };

            const {
                result: {
                    current: { error },
                },
            } = renderHook(() => usePayPalGuestPaymentSession(props));

            expectCurrentErrorValue(error);

            expect(error).toEqual(new Error("no sdk instance available"));
            expect(
                mockSdkInstance.createPayPalGuestOneTimePaymentSession,
            ).not.toHaveBeenCalled();
        });

        test("should not error if there is no sdkInstance but loading is still pending", () => {
            mockPayPalPending();

            const props: UsePayPalGuestPaymentSessionProps = {
                orderId: "test-order-id",
                onApprove: jest.fn(),
            };

            const {
                result: {
                    current: { error },
                },
            } = renderHook(() => usePayPalGuestPaymentSession(props));

            expect(error).toBeNull();
        });

        test("should clear any sdkInstance related errors if the sdkInstance becomes available", () => {
            const mockSession = createMockPayPalGuestSession();
            const mockSdkInstanceNew = createMockSdkInstance(mockSession);

            // First render: no sdkInstance and not in PENDING state, should error
            mockPayPalRejected();

            const props: UsePayPalGuestPaymentSessionProps = {
                orderId: "test-order-id",
                onApprove: jest.fn(),
            };

            const { result, rerender } = renderHook(() =>
                usePayPalGuestPaymentSession(props),
            );

            expectCurrentErrorValue(result.current.error);
            expect(result.current.error).toEqual(
                new Error("no sdk instance available"),
            );

            // Second render: sdkInstance becomes available, error should clear
            mockPayPalContext({ sdkInstance: mockSdkInstanceNew });

            rerender();

            expect(result.current.error).toBeNull();
        });

        test.each([
            {
                description: "Error object",
                thrownError: new Error("Required components not loaded in SDK"),
                expectedMessage: "Required components not loaded in SDK",
            },
            {
                description: "non-Error string",
                thrownError: "String error message",
                expectedMessage: "String error message",
            },
        ])(
            "should handle $description thrown by createPayPalGuestOneTimePaymentSession",
            ({ thrownError, expectedMessage }) => {
                const mockSdkInstanceWithError = {
                    createPayPalGuestOneTimePaymentSession: jest
                        .fn()
                        .mockImplementation(() => {
                            throw thrownError;
                        }),
                };

                mockPayPalContext({ sdkInstance: mockSdkInstanceWithError });

                const props: UsePayPalGuestPaymentSessionProps = {
                    orderId: "test-order-id",
                    onApprove: jest.fn(),
                    onCancel: jest.fn(),
                    onError: jest.fn(),
                };

                const {
                    result: {
                        current: { error },
                    },
                } = renderHook(() => usePayPalGuestPaymentSession(props));

                expectCurrentErrorValue(error);

                expect(error?.message).toContain(
                    "Failed to create PayPal guest one-time payment session",
                );
                expect(error?.message).toContain(
                    "This may occur if the required components are not included in the SDK components array",
                );
                expect(error?.message).toContain(expectedMessage);
            },
        );

        test.each([
            [INSTANCE_LOADING_STATE.PENDING, true],
            [INSTANCE_LOADING_STATE.RESOLVED, false],
            [INSTANCE_LOADING_STATE.REJECTED, false],
        ])(
            "should return isPending as %s when loadingStatus is %s",
            (loadingStatus, expectedIsPending) => {
                mockPayPalContext({ loadingStatus });

                const props: UsePayPalGuestPaymentSessionProps = {
                    orderId: "test-order-id",
                    onApprove: jest.fn(),
                };

                const { result } = renderHook(() =>
                    usePayPalGuestPaymentSession(props),
                );

                expect(result.current.isPending).toBe(expectedIsPending);
            },
        );

        test("should create a BCDC payment session when the hook is called with orderId", () => {
            const onApprove = jest.fn();
            const onCancel = jest.fn();
            const onError = jest.fn();

            const props: UsePayPalGuestPaymentSessionProps = {
                orderId: "test-order-id",
                onApprove,
                onCancel,
                onError,
            };

            renderHook(() => usePayPalGuestPaymentSession(props));

            const createSessionCall =
                mockSdkInstance.createPayPalGuestOneTimePaymentSession.mock
                    .calls[0][0];

            expect(
                mockSdkInstance.createPayPalGuestOneTimePaymentSession,
            ).toHaveBeenCalledWith({
                orderId: "test-order-id",
                onApprove,
                onCancel,
                onError,
            });

            const mockData = { orderId: "test-order-id" };
            createSessionCall.onApprove(mockData);
            createSessionCall.onCancel();
            createSessionCall.onError(new Error("test error"));

            expect(onApprove).toHaveBeenCalledWith(mockData);
            expect(onCancel).toHaveBeenCalled();
            expect(onError).toHaveBeenCalledWith(new Error("test error"));
        });

        test("should create a BCDC payment session without orderId when createOrder callback is provided", () => {
            const mockCreateOrder = jest
                .fn()
                .mockReturnValue(
                    Promise.resolve({ orderId: "created-order-id" }),
                );
            const onApprove = jest.fn();
            const onCancel = jest.fn();
            const onError = jest.fn();

            const props: UsePayPalGuestPaymentSessionProps = {
                createOrder: mockCreateOrder,
                onApprove,
                onCancel,
                onError,
            };

            renderHook(() => usePayPalGuestPaymentSession(props));

            const createSessionCall =
                mockSdkInstance.createPayPalGuestOneTimePaymentSession.mock
                    .calls[0][0];

            expect(
                mockSdkInstance.createPayPalGuestOneTimePaymentSession,
            ).toHaveBeenCalledWith({
                orderId: undefined,
                onApprove,
                onCancel,
                onError,
            });

            const mockData = { orderId: "created-order-id" };
            createSessionCall.onApprove(mockData);
            createSessionCall.onCancel();
            createSessionCall.onError(new Error("test error"));

            expect(onApprove).toHaveBeenCalledWith(mockData);
            expect(onCancel).toHaveBeenCalled();
            expect(onError).toHaveBeenCalledWith(new Error("test error"));
        });

        test("should create session with shipping callbacks when provided", () => {
            const onShippingAddressChange = jest.fn();
            const onShippingOptionsChange = jest.fn();
            const onApprove = jest.fn();

            const props: UsePayPalGuestPaymentSessionProps = {
                orderId: "test-order-id",
                onApprove,
                onShippingAddressChange,
                onShippingOptionsChange,
            };

            renderHook(() => usePayPalGuestPaymentSession(props));

            expect(
                mockSdkInstance.createPayPalGuestOneTimePaymentSession,
            ).toHaveBeenCalledWith({
                orderId: "test-order-id",
                onApprove,
                onShippingAddressChange,
                onShippingOptionsChange,
            });
        });

        test("should not include shipping callbacks when not provided", () => {
            const onApprove = jest.fn();

            const props: UsePayPalGuestPaymentSessionProps = {
                orderId: "test-order-id",
                onApprove,
            };

            renderHook(() => usePayPalGuestPaymentSession(props));

            expect(
                mockSdkInstance.createPayPalGuestOneTimePaymentSession,
            ).toHaveBeenCalledWith({
                orderId: "test-order-id",
                onApprove,
            });
        });

        test("should return buttonRef in the hook result", () => {
            const props: UsePayPalGuestPaymentSessionProps = {
                orderId: "test-order-id",
                onApprove: jest.fn(),
            };

            const { result } = renderHook(() =>
                usePayPalGuestPaymentSession(props),
            );

            expect(result.current.buttonRef).toBeDefined();
            expect(result.current.buttonRef.current).toBeNull();
        });
    });

    describe("session lifecycle", () => {
        test("should destroy session on unmount", () => {
            const props: UsePayPalGuestPaymentSessionProps = {
                orderId: "test-order-id",
                onApprove: jest.fn(),
            };

            const { unmount } = renderHook(() =>
                usePayPalGuestPaymentSession(props),
            );

            unmount();

            expect(mockPayPalSession.destroy).toHaveBeenCalled();
        });

        test("should destroy the previous session when the hook re-runs with a new orderId", () => {
            const onApprove = jest.fn();
            const { rerender } = renderHook(
                ({ orderId }) =>
                    usePayPalGuestPaymentSession({
                        orderId,
                        onApprove,
                    }),
                { initialProps: { orderId: "test-order-id-1" } },
            );

            jest.clearAllMocks();

            rerender({ orderId: "test-order-id-2" });

            expect(mockPayPalSession.destroy).toHaveBeenCalled();
            expect(
                mockSdkInstance.createPayPalGuestOneTimePaymentSession,
            ).toHaveBeenCalledWith({
                orderId: "test-order-id-2",
                onApprove,
            });
        });

        test("should destroy the previous session when the hook re-runs with a new sdkInstance", () => {
            const props: UsePayPalGuestPaymentSessionProps = {
                orderId: "test-order-id",
                onApprove: jest.fn(),
            };

            const { rerender } = renderHook(() =>
                usePayPalGuestPaymentSession(props),
            );

            jest.clearAllMocks();

            const newMockSession = createMockPayPalGuestSession();
            const newMockSdkInstance = createMockSdkInstance(newMockSession);

            mockPayPalContext({ sdkInstance: newMockSdkInstance });

            rerender();

            expect(mockPayPalSession.destroy).toHaveBeenCalled();
            expect(
                newMockSdkInstance.createPayPalGuestOneTimePaymentSession,
            ).toHaveBeenCalled();
        });

        test("should recreate session when shipping callbacks are added", () => {
            const onApprove = jest.fn();
            const onShippingAddressChange = jest.fn();

            const { rerender } = renderHook(
                ({ hasShipping }) =>
                    usePayPalGuestPaymentSession({
                        orderId: "test-order-id",
                        onApprove,
                        ...(hasShipping ? { onShippingAddressChange } : {}),
                    }),
                { initialProps: { hasShipping: false } },
            );

            jest.clearAllMocks();

            rerender({ hasShipping: true });

            expect(mockPayPalSession.destroy).toHaveBeenCalled();
            expect(
                mockSdkInstance.createPayPalGuestOneTimePaymentSession,
            ).toHaveBeenCalledWith({
                orderId: "test-order-id",
                onApprove,
                onShippingAddressChange,
            });
        });

        test("should recreate session when shipping callbacks are removed", () => {
            const onApprove = jest.fn();
            const onShippingAddressChange = jest.fn();

            const { rerender } = renderHook(
                ({ hasShipping }) =>
                    usePayPalGuestPaymentSession({
                        orderId: "test-order-id",
                        onApprove,
                        ...(hasShipping ? { onShippingAddressChange } : {}),
                    }),
                { initialProps: { hasShipping: true } },
            );

            jest.clearAllMocks();

            rerender({ hasShipping: false });

            expect(mockPayPalSession.destroy).toHaveBeenCalled();
            expect(
                mockSdkInstance.createPayPalGuestOneTimePaymentSession,
            ).toHaveBeenCalledWith({
                orderId: "test-order-id",
                onApprove,
            });
        });

        test("should not re-run if non-shipping callbacks are updated", () => {
            mockUseProxyProps.mockImplementation(
                jest.requireActual("../utils").useProxyProps,
            );

            const initialOnApprove = jest.fn();
            const newOnApprove = jest.fn();

            const { rerender } = renderHook(
                ({ onApprove }) =>
                    usePayPalGuestPaymentSession({
                        orderId: "test-order-id",
                        onApprove,
                    }),
                { initialProps: { onApprove: initialOnApprove } },
            );

            jest.clearAllMocks();

            rerender({ onApprove: newOnApprove });

            expect(mockPayPalSession.destroy).not.toHaveBeenCalled();
            expect(
                mockSdkInstance.createPayPalGuestOneTimePaymentSession,
            ).not.toHaveBeenCalled();
        });
    });

    describe("handleClick", () => {
        test("should provide a click handler that calls session start with auto presentation mode", async () => {
            const props: UsePayPalGuestPaymentSessionProps = {
                orderId: "test-order-id",
                onApprove: jest.fn(),
            };

            const { result } = renderHook(() =>
                usePayPalGuestPaymentSession(props),
            );

            await act(async () => {
                await result.current.handleClick();
            });

            expect(mockPayPalSession.start).toHaveBeenCalledWith(
                {
                    presentationMode: "auto",
                    fullPageOverlay: undefined,
                },
                undefined,
            );
        });

        test("should include fullPageOverlay in start options when provided", async () => {
            const props: UsePayPalGuestPaymentSessionProps = {
                orderId: "test-order-id",
                onApprove: jest.fn(),
                fullPageOverlay: { enabled: true },
            };

            const { result } = renderHook(() =>
                usePayPalGuestPaymentSession(props),
            );

            await act(async () => {
                await result.current.handleClick();
            });

            expect(mockPayPalSession.start).toHaveBeenCalledWith(
                {
                    presentationMode: "auto",
                    fullPageOverlay: { enabled: true },
                },
                undefined,
            );
        });

        test("should use buttonRef as targetElement when buttonRef is set", async () => {
            const props: UsePayPalGuestPaymentSessionProps = {
                orderId: "test-order-id",
                onApprove: jest.fn(),
            };

            const { result } = renderHook(() =>
                usePayPalGuestPaymentSession(props),
            );

            const mockButton = document.createElement("button");
            result.current.buttonRef.current = mockButton;

            await act(async () => {
                await result.current.handleClick();
            });

            expect(mockPayPalSession.start).toHaveBeenCalledWith(
                {
                    presentationMode: "auto",
                    fullPageOverlay: undefined,
                    targetElement: mockButton,
                },
                undefined,
            );
        });

        test("should call the createOrder callback on start inside the click handler", async () => {
            const mockCreateOrder = jest
                .fn()
                .mockReturnValue(
                    Promise.resolve({ orderId: "created-order-id" }),
                );

            const props: UsePayPalGuestPaymentSessionProps = {
                createOrder: mockCreateOrder,
                onApprove: jest.fn(),
            };

            const { result } = renderHook(() =>
                usePayPalGuestPaymentSession(props),
            );

            await act(async () => {
                await result.current.handleClick();
            });

            expect(mockPayPalSession.start).toHaveBeenCalledWith(
                {
                    presentationMode: "auto",
                    fullPageOverlay: undefined,
                },
                expect.any(Promise),
            );
            expect(mockCreateOrder).toHaveBeenCalled();
        });

        test("should do nothing if the click handler is called and there is no session", async () => {
            const props: UsePayPalGuestPaymentSessionProps = {
                orderId: "test-order-id",
                onApprove: jest.fn(),
            };

            const { result, unmount } = renderHook(() =>
                usePayPalGuestPaymentSession(props),
            );

            unmount();

            await act(async () => {
                await result.current.handleClick();
            });

            const { error } = result.current;

            expectCurrentErrorValue(error);

            expect(error).toBeNull();
            expect(mockPayPalSession.start).not.toHaveBeenCalled();
        });

        test("should handle errors from session.start()", async () => {
            const mockError = new Error("Session start failed");
            mockPayPalSession.start = jest.fn().mockRejectedValue(mockError);

            const props: UsePayPalGuestPaymentSessionProps = {
                orderId: "test-order-id",
                onApprove: jest.fn(),
            };

            const { result } = renderHook(() =>
                usePayPalGuestPaymentSession(props),
            );

            await act(async () => {
                await result.current.handleClick();
            });

            expectCurrentErrorValue(result.current.error);
            expect(result.current.error).toEqual(mockError);
        });
    });

    describe("handleCancel", () => {
        test("should provide a cancel handler that cancels the session", () => {
            const props: UsePayPalGuestPaymentSessionProps = {
                orderId: "test-order-id",
                onApprove: jest.fn(),
            };

            const { result } = renderHook(() =>
                usePayPalGuestPaymentSession(props),
            );

            act(() => {
                result.current.handleCancel();
            });

            expect(mockPayPalSession.cancel).toHaveBeenCalled();
        });

        test("should not throw error when session is not available", () => {
            const props: UsePayPalGuestPaymentSessionProps = {
                orderId: "test-order-id",
                onApprove: jest.fn(),
            };

            const { result, unmount } = renderHook(() =>
                usePayPalGuestPaymentSession(props),
            );

            unmount();

            expect(() => {
                act(() => {
                    result.current.handleCancel();
                });
            }).not.toThrow();
        });
    });

    describe("handleDestroy", () => {
        test("should provide a destroy handler that destroys the session", () => {
            const props: UsePayPalGuestPaymentSessionProps = {
                orderId: "test-order-id",
                onApprove: jest.fn(),
            };

            const { result } = renderHook(() =>
                usePayPalGuestPaymentSession(props),
            );

            act(() => {
                result.current.handleDestroy();
            });

            expect(mockPayPalSession.destroy).toHaveBeenCalled();
        });

        test("should not throw error when session is not available", () => {
            const props: UsePayPalGuestPaymentSessionProps = {
                orderId: "test-order-id",
                onApprove: jest.fn(),
            };

            const { result, unmount } = renderHook(() =>
                usePayPalGuestPaymentSession(props),
            );

            unmount();

            expect(() => {
                act(() => {
                    result.current.handleDestroy();
                });
            }).not.toThrow();
        });

        test("should handle manually destroyed session gracefully", async () => {
            const props: UsePayPalGuestPaymentSessionProps = {
                orderId: "test-order-id",
                onApprove: jest.fn(),
            };

            const { result } = renderHook(() =>
                usePayPalGuestPaymentSession(props),
            );

            act(() => {
                result.current.handleDestroy();
            });

            await act(async () => {
                await result.current.handleClick();
            });

            expectCurrentErrorValue(result.current.error);
            expect(result.current.error).toEqual(
                new Error("PayPal Guest Checkout session not available"),
            );
        });
    });
});
