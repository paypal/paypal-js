import { renderHook, act } from "@testing-library/react-hooks";

import { expectCurrentErrorValue } from "./useErrorTestUtil";
import { usePayPalCreditOneTimePaymentSession } from "./usePayPalCreditOneTimePaymentSession";
import { usePayPal } from "./usePayPal";
import { useProxyProps } from "../utils";
import { INSTANCE_LOADING_STATE, type OneTimePaymentSession } from "../types";

import type { UsePayPalCreditOneTimePaymentSessionProps } from "./usePayPalCreditOneTimePaymentSession";

jest.mock("./usePayPal");

jest.mock("../utils", () => ({
    useProxyProps: jest.fn(),
}));

const mockUsePayPal = usePayPal as jest.MockedFunction<typeof usePayPal>;
const mockUseProxyProps = useProxyProps as jest.MockedFunction<
    typeof useProxyProps
>;

const createMockPayPalSession = (): OneTimePaymentSession => ({
    start: jest.fn().mockResolvedValue(undefined),
    cancel: jest.fn(),
    destroy: jest.fn(),
});

const createMockSdkInstance = (paypalSession = createMockPayPalSession()) => ({
    createPayPalCreditOneTimePaymentSession: jest
        .fn()
        .mockReturnValue(paypalSession),
});

describe("usePayPalCreditOneTimePaymentSession", () => {
    let mockPayPalSession: OneTimePaymentSession;
    let mockSdkInstance: ReturnType<typeof createMockSdkInstance>;

    beforeEach(() => {
        mockUseProxyProps.mockImplementation((callbacks) => callbacks);

        mockPayPalSession = createMockPayPalSession();
        mockSdkInstance = createMockSdkInstance(mockPayPalSession);

        mockUsePayPal.mockReturnValue({
            // @ts-expect-error mocking sdk instance
            sdkInstance: mockSdkInstance,
            loadingStatus: INSTANCE_LOADING_STATE.RESOLVED,
            eligiblePaymentMethods: null,
            error: null,
            isHydrated: true,
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("initialization", () => {
        test("should not create session when no SDK instance is available", () => {
            mockUsePayPal.mockReturnValue({
                sdkInstance: null,
                loadingStatus: INSTANCE_LOADING_STATE.REJECTED,
                eligiblePaymentMethods: null,
                error: null,
                isHydrated: true,
            });

            const props: UsePayPalCreditOneTimePaymentSessionProps = {
                presentationMode: "popup",
                orderId: "test-order-id",
                onApprove: jest.fn(),
                onCancel: jest.fn(),
                onError: jest.fn(),
            };

            const {
                result: {
                    current: { error },
                },
            } = renderHook(() => usePayPalCreditOneTimePaymentSession(props));

            expectCurrentErrorValue(error);

            expect(error).toEqual(new Error("no sdk instance available"));
            expect(
                mockSdkInstance.createPayPalCreditOneTimePaymentSession,
            ).not.toHaveBeenCalled();
        });

        test("should not error if there is no sdkInstance but loading is still pending", () => {
            mockUsePayPal.mockReturnValue({
                sdkInstance: null,
                loadingStatus: INSTANCE_LOADING_STATE.PENDING,
                eligiblePaymentMethods: null,
                error: null,
                isHydrated: true,
            });

            const props: UsePayPalCreditOneTimePaymentSessionProps = {
                presentationMode: "popup",
                orderId: "test-order-id",
                onApprove: jest.fn(),
            };

            const {
                result: {
                    current: { error },
                },
            } = renderHook(() => usePayPalCreditOneTimePaymentSession(props));

            expect(error).toBeNull();
        });

        test("should clear any sdkInstance related errors if the sdkInstance becomes available", () => {
            const mockSession = createMockPayPalSession();
            const mockSdkInstanceNew = createMockSdkInstance(mockSession);

            // First render: no sdkInstance and not in PENDING state, should error
            mockUsePayPal.mockReturnValue({
                sdkInstance: null,
                loadingStatus: INSTANCE_LOADING_STATE.REJECTED,
                eligiblePaymentMethods: null,
                error: null,
                isHydrated: true,
            });

            const props: UsePayPalCreditOneTimePaymentSessionProps = {
                presentationMode: "popup",
                orderId: "test-order-id",
                onApprove: jest.fn(),
            };

            const { result, rerender } = renderHook(() =>
                usePayPalCreditOneTimePaymentSession(props),
            );

            expectCurrentErrorValue(result.current.error);
            expect(result.current.error).toEqual(
                new Error("no sdk instance available"),
            );

            // Second render: sdkInstance becomes available, error should clear
            mockUsePayPal.mockReturnValue({
                // @ts-expect-error mocking sdk instance
                sdkInstance: mockSdkInstanceNew,
                loadingStatus: INSTANCE_LOADING_STATE.RESOLVED,
                eligiblePaymentMethods: null,
                error: null,
                isHydrated: true,
            });

            rerender();

            expect(result.current.error).toBeNull();
        });

        test.each([
            [INSTANCE_LOADING_STATE.PENDING, true],
            [INSTANCE_LOADING_STATE.RESOLVED, false],
            [INSTANCE_LOADING_STATE.REJECTED, false],
        ])(
            "should return isPending as %s when loadingStatus is %s",
            (loadingStatus, expectedIsPending) => {
                mockUsePayPal.mockReturnValue({
                    sdkInstance: null,
                    loadingStatus,
                    eligiblePaymentMethods: null,
                    error: null,
                    isHydrated: true,
                });

                const props: UsePayPalCreditOneTimePaymentSessionProps = {
                    presentationMode: "popup",
                    orderId: "test-order-id",
                    onApprove: jest.fn(),
                };

                const { result } = renderHook(() =>
                    usePayPalCreditOneTimePaymentSession(props),
                );

                expect(result.current.isPending).toBe(expectedIsPending);
            },
        );

        test("should create a PayPal payment session when the hook is called with orderId", () => {
            const onApprove = jest.fn();
            const onCancel = jest.fn();
            const onError = jest.fn();

            const props: UsePayPalCreditOneTimePaymentSessionProps = {
                presentationMode: "popup",
                orderId: "test-order-id",
                onApprove,
                onCancel,
                onError,
            };

            renderHook(() => usePayPalCreditOneTimePaymentSession(props));

            const createSessionCall =
                mockSdkInstance.createPayPalCreditOneTimePaymentSession.mock
                    .calls[0][0];

            expect(
                mockSdkInstance.createPayPalCreditOneTimePaymentSession,
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

        test("should create a PayPal payment session without orderId when createOrder callback is provided", () => {
            const mockCreateOrder = jest
                .fn()
                .mockReturnValue(
                    Promise.resolve({ orderId: "created-order-id" }),
                );
            const onApprove = jest.fn();
            const onCancel = jest.fn();
            const onError = jest.fn();

            const props: UsePayPalCreditOneTimePaymentSessionProps = {
                presentationMode: "popup",
                createOrder: mockCreateOrder,
                onApprove,
                onCancel,
                onError,
            };

            renderHook(() => usePayPalCreditOneTimePaymentSession(props));

            const createSessionCall =
                mockSdkInstance.createPayPalCreditOneTimePaymentSession.mock
                    .calls[0][0];

            expect(
                mockSdkInstance.createPayPalCreditOneTimePaymentSession,
            ).toHaveBeenCalledWith({
                orderId: undefined,
                onApprove,
                onCancel,
                onError,
            });

            const mockData = { test: "data" };
            createSessionCall.onApprove(mockData);
            createSessionCall.onCancel();
            createSessionCall.onError(new Error("test error"));

            expect(onApprove).toHaveBeenCalledWith(mockData);
            expect(onCancel).toHaveBeenCalled();
            expect(onError).toHaveBeenCalledWith(new Error("test error"));
        });
    });

    describe("session lifecycle", () => {
        test("should destroy session on unmount", () => {
            const props: UsePayPalCreditOneTimePaymentSessionProps = {
                presentationMode: "popup",
                orderId: "test-order-id",
                onApprove: jest.fn(),
                onCancel: jest.fn(),
                onError: jest.fn(),
            };

            const { unmount } = renderHook(() =>
                usePayPalCreditOneTimePaymentSession(props),
            );

            unmount();

            expect(mockPayPalSession.destroy).toHaveBeenCalled();
        });

        test("should destroy the previous session when the hook re-runs with a new orderId", () => {
            const onApprove = jest.fn();
            const onCancel = jest.fn();
            const onError = jest.fn();
            const { rerender } = renderHook(
                ({ orderId }) =>
                    usePayPalCreditOneTimePaymentSession({
                        presentationMode: "popup",
                        orderId,
                        onApprove,
                        onCancel,
                        onError,
                    }),
                { initialProps: { orderId: "test-order-id-1" } },
            );

            jest.clearAllMocks();

            rerender({ orderId: "test-order-id-2" });

            expect(mockPayPalSession.destroy).toHaveBeenCalled();
            expect(
                mockSdkInstance.createPayPalCreditOneTimePaymentSession,
            ).toHaveBeenCalledWith({
                orderId: "test-order-id-2",
                onApprove,
                onCancel,
                onError,
            });
        });

        test("should destroy the previous session when the hook re-runs with a new sdkInstance", () => {
            const props: UsePayPalCreditOneTimePaymentSessionProps = {
                presentationMode: "popup",
                orderId: "test-order-id",
                onApprove: jest.fn(),
                onCancel: jest.fn(),
                onError: jest.fn(),
            };

            const { rerender } = renderHook(() =>
                usePayPalCreditOneTimePaymentSession(props),
            );

            jest.clearAllMocks();

            const newMockSession = createMockPayPalSession();
            const newMockSdkInstance = createMockSdkInstance(newMockSession);

            mockUsePayPal.mockReturnValue({
                // @ts-expect-error mocking sdk instance
                sdkInstance: newMockSdkInstance,
                loadingStatus: INSTANCE_LOADING_STATE.RESOLVED,
                eligiblePaymentMethods: null,
                error: null,
                isHydrated: true,
            });

            rerender();

            expect(mockPayPalSession.destroy).toHaveBeenCalled();
            expect(
                newMockSdkInstance.createPayPalCreditOneTimePaymentSession,
            ).toHaveBeenCalled();
        });

        test("should not re-run if callbacks are updated", () => {
            mockUseProxyProps.mockImplementation(
                jest.requireActual("../utils").useProxyProps,
            );

            const initialOnApprove = jest.fn();
            const newOnApprove = jest.fn();

            const { rerender } = renderHook(
                ({ onApprove }) =>
                    usePayPalCreditOneTimePaymentSession({
                        presentationMode: "popup",
                        orderId: "test-order-id",
                        onApprove,
                    }),
                { initialProps: { onApprove: initialOnApprove } },
            );

            jest.clearAllMocks();

            rerender({ onApprove: newOnApprove });

            expect(mockPayPalSession.destroy).not.toHaveBeenCalled();
            expect(
                mockSdkInstance.createPayPalCreditOneTimePaymentSession,
            ).not.toHaveBeenCalled();
        });
    });

    describe("handleClick", () => {
        test("should provide a click handler that calls session start with presentation mode", async () => {
            const props: UsePayPalCreditOneTimePaymentSessionProps = {
                presentationMode: "popup",
                orderId: "test-order-id",
                onApprove: jest.fn(),
                onCancel: jest.fn(),
                onError: jest.fn(),
            };

            const { result } = renderHook(() =>
                usePayPalCreditOneTimePaymentSession(props),
            );

            await act(async () => {
                await result.current.handleClick();
            });

            expect(mockPayPalSession.start).toHaveBeenCalledWith(
                {
                    presentationMode: "popup",
                    fullPageOverlay: undefined,
                    autoRedirect: undefined,
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

            const props: UsePayPalCreditOneTimePaymentSessionProps = {
                presentationMode: "popup",
                createOrder: mockCreateOrder,
                onApprove: jest.fn(),
                onCancel: jest.fn(),
                onError: jest.fn(),
            };

            const { result } = renderHook(() =>
                usePayPalCreditOneTimePaymentSession(props),
            );

            await act(async () => {
                await result.current.handleClick();
            });

            expect(mockPayPalSession.start).toHaveBeenCalledWith(
                {
                    presentationMode: "popup",
                    fullPageOverlay: undefined,
                    autoRedirect: undefined,
                },
                expect.any(Promise),
            );
            expect(mockCreateOrder).toHaveBeenCalled();
        });

        test("should do nothing if the click handler is called and there is no session", async () => {
            const props: UsePayPalCreditOneTimePaymentSessionProps = {
                presentationMode: "popup",
                orderId: "test-order-id",
                onApprove: jest.fn(),
                onCancel: jest.fn(),
                onError: jest.fn(),
            };

            const { result, unmount } = renderHook(() =>
                usePayPalCreditOneTimePaymentSession(props),
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

        test("should handle different presentation modes", async () => {
            const presentationModes = ["auto", "popup", "modal"] as const;

            for (const mode of presentationModes) {
                const props: UsePayPalCreditOneTimePaymentSessionProps = {
                    presentationMode: mode,
                    orderId: "test-order-id",
                    onApprove: jest.fn(),
                    onCancel: jest.fn(),
                    onError: jest.fn(),
                };

                const { result } = renderHook(() =>
                    usePayPalCreditOneTimePaymentSession(props),
                );

                await act(async () => {
                    await result.current.handleClick();
                });

                expect(mockPayPalSession.start).toHaveBeenCalledWith(
                    {
                        presentationMode: mode,
                        fullPageOverlay: undefined,
                        autoRedirect: undefined,
                    },
                    undefined,
                );

                jest.clearAllMocks();
                mockPayPalSession = createMockPayPalSession();
                mockSdkInstance = createMockSdkInstance(mockPayPalSession);
                mockUsePayPal.mockReturnValue({
                    // @ts-expect-error mocking sdk instance
                    sdkInstance: mockSdkInstance,
                    loadingStatus: INSTANCE_LOADING_STATE.RESOLVED,
                    eligiblePaymentMethods: null,
                    error: null,
                    isHydrated: true,
                });
            }
        });
    });

    describe("handleCancel", () => {
        test("should provide a cancel handler that cancels the session", () => {
            const props: UsePayPalCreditOneTimePaymentSessionProps = {
                presentationMode: "popup",
                orderId: "test-order-id",
                onApprove: jest.fn(),
                onCancel: jest.fn(),
                onError: jest.fn(),
            };

            const { result } = renderHook(() =>
                usePayPalCreditOneTimePaymentSession(props),
            );

            act(() => {
                result.current.handleCancel();
            });

            expect(mockPayPalSession.cancel).toHaveBeenCalled();
        });

        test("should not throw error when session is not available", () => {
            const props: UsePayPalCreditOneTimePaymentSessionProps = {
                presentationMode: "popup",
                orderId: "test-order-id",
                onApprove: jest.fn(),
                onCancel: jest.fn(),
                onError: jest.fn(),
            };

            const { result, unmount } = renderHook(() =>
                usePayPalCreditOneTimePaymentSession(props),
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
            const props: UsePayPalCreditOneTimePaymentSessionProps = {
                presentationMode: "popup",
                orderId: "test-order-id",
                onApprove: jest.fn(),
                onCancel: jest.fn(),
                onError: jest.fn(),
            };

            const { result } = renderHook(() =>
                usePayPalCreditOneTimePaymentSession(props),
            );

            act(() => {
                result.current.handleDestroy();
            });

            expect(mockPayPalSession.destroy).toHaveBeenCalled();
        });

        test("should not throw error when session is not available", () => {
            const props: UsePayPalCreditOneTimePaymentSessionProps = {
                presentationMode: "popup",
                orderId: "test-order-id",
                onApprove: jest.fn(),
                onCancel: jest.fn(),
                onError: jest.fn(),
            };

            const { result, unmount } = renderHook(() =>
                usePayPalCreditOneTimePaymentSession(props),
            );

            unmount();

            expect(() => {
                act(() => {
                    result.current.handleDestroy();
                });
            }).not.toThrow();
        });

        test("should handle manually destroyed session gracefully", async () => {
            const props: UsePayPalCreditOneTimePaymentSessionProps = {
                presentationMode: "popup",
                orderId: "test-order-id",
                onApprove: jest.fn(),
                onCancel: jest.fn(),
                onError: jest.fn(),
            };

            const { result } = renderHook(() =>
                usePayPalCreditOneTimePaymentSession(props),
            );

            act(() => {
                result.current.handleDestroy();
            });

            await act(async () => {
                await result.current.handleClick();
            });

            const { error } = result.current;

            expectCurrentErrorValue(error);

            expect(error).toEqual(new Error("PayPal session not available"));
        });
    });
});
