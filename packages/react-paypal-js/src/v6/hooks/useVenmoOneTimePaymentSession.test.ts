import { renderHook, act } from "@testing-library/react-hooks";

import { useVenmoOneTimePaymentSession } from "./useVenmoOneTimePaymentSession";
import { usePayPal } from "./usePayPal";
import { useProxyProps } from "../utils";
import {
    INSTANCE_LOADING_STATE,
    type VenmoOneTimePaymentSession,
} from "../types";

import type { UseVenmoOneTimePaymentSessionProps } from "./useVenmoOneTimePaymentSession";

jest.mock("./usePayPal");

jest.mock("../utils", () => ({
    useProxyProps: jest.fn(),
}));

const mockUsePayPal = usePayPal as jest.MockedFunction<typeof usePayPal>;
const mockUseProxyProps = useProxyProps as jest.MockedFunction<
    typeof useProxyProps
>;

const createMockVenmoSession = (): VenmoOneTimePaymentSession => ({
    start: jest.fn().mockResolvedValue(undefined),
    cancel: jest.fn(),
    destroy: jest.fn(),
});

const createMockSdkInstance = (venmoSession = createMockVenmoSession()) => ({
    createVenmoOneTimePaymentSession: jest.fn().mockReturnValue(venmoSession),
});

describe("useVenmoOneTimePaymentSession", () => {
    let mockVenmoSession: VenmoOneTimePaymentSession;
    let mockSdkInstance: ReturnType<typeof createMockSdkInstance>;

    beforeEach(() => {
        mockUseProxyProps.mockImplementation((callbacks) => callbacks);

        mockVenmoSession = createMockVenmoSession();
        mockSdkInstance = createMockSdkInstance(mockVenmoSession);

        mockUsePayPal.mockReturnValue({
            // @ts-expect-error mocking sdk instance
            sdkInstance: mockSdkInstance,
            loadingStatus: INSTANCE_LOADING_STATE.RESOLVED,
            eligiblePaymentMethods: null,
            error: null,
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("initialization", () => {
        test("should not create session when no SDK instance is available", () => {
            mockUsePayPal.mockReturnValue({
                sdkInstance: null,
                loadingStatus: INSTANCE_LOADING_STATE.PENDING,
                eligiblePaymentMethods: null,
                error: null,
            });

            const props: UseVenmoOneTimePaymentSessionProps = {
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
            } = renderHook(() => useVenmoOneTimePaymentSession(props));

            expect(error).toEqual(new Error("no sdk instance available"));
        });

        test("should create Venmo session with orderId when provided", () => {
            const onApprove = jest.fn();
            const onCancel = jest.fn();
            const onError = jest.fn();

            const props: UseVenmoOneTimePaymentSessionProps = {
                presentationMode: "popup",
                orderId: "test-order-id",
                onApprove,
                onCancel,
                onError,
            };

            renderHook(() => useVenmoOneTimePaymentSession(props));

            const createSessionCall =
                mockSdkInstance.createVenmoOneTimePaymentSession.mock
                    .calls[0][0];

            expect(
                mockSdkInstance.createVenmoOneTimePaymentSession,
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

        test("should create Venmo session without orderId when createOrder is provided", () => {
            const mockCreateOrder = jest
                .fn()
                .mockReturnValue(Promise.resolve("created-order-id"));
            const onApprove = jest.fn();
            const onCancel = jest.fn();
            const onError = jest.fn();

            const props: UseVenmoOneTimePaymentSessionProps = {
                presentationMode: "popup",
                createOrder: mockCreateOrder,
                onApprove,
                onCancel,
                onError,
            };

            renderHook(() => useVenmoOneTimePaymentSession(props));

            const createSessionCall =
                mockSdkInstance.createVenmoOneTimePaymentSession.mock
                    .calls[0][0];

            expect(
                mockSdkInstance.createVenmoOneTimePaymentSession,
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
            const props: UseVenmoOneTimePaymentSessionProps = {
                presentationMode: "popup",
                orderId: "test-order-id",
                onApprove: jest.fn(),
                onCancel: jest.fn(),
                onError: jest.fn(),
            };

            const { unmount } = renderHook(() =>
                useVenmoOneTimePaymentSession(props),
            );

            unmount();

            expect(mockVenmoSession.destroy).toHaveBeenCalled();
        });

        test("should recreate session when orderId changes", () => {
            const onApprove = jest.fn();
            const onCancel = jest.fn();
            const onError = jest.fn();
            const { rerender } = renderHook(
                ({ orderId }) =>
                    useVenmoOneTimePaymentSession({
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

            expect(mockVenmoSession.destroy).toHaveBeenCalled();
            expect(
                mockSdkInstance.createVenmoOneTimePaymentSession,
            ).toHaveBeenCalledWith({
                orderId: "test-order-id-2",
                onApprove,
                onCancel,
                onError,
            });
        });

        test("should recreate session when SDK instance changes", () => {
            const props: UseVenmoOneTimePaymentSessionProps = {
                presentationMode: "popup",
                orderId: "test-order-id",
                onApprove: jest.fn(),
                onCancel: jest.fn(),
                onError: jest.fn(),
            };

            const { rerender } = renderHook(() =>
                useVenmoOneTimePaymentSession(props),
            );

            jest.clearAllMocks();

            const newMockSession = createMockVenmoSession();
            const newMockSdkInstance = createMockSdkInstance(newMockSession);

            mockUsePayPal.mockReturnValue({
                // @ts-expect-error mocking sdk instance
                sdkInstance: newMockSdkInstance,
                loadingStatus: INSTANCE_LOADING_STATE.RESOLVED,
                eligiblePaymentMethods: null,
                error: null,
            });

            rerender();

            expect(mockVenmoSession.destroy).toHaveBeenCalled();
            expect(
                newMockSdkInstance.createVenmoOneTimePaymentSession,
            ).toHaveBeenCalled();
        });

        test("should NOT recreate session when only callbacks change", () => {
            mockUseProxyProps.mockImplementation(
                jest.requireActual("../utils").useProxyProps,
            );

            const initialOnApprove = jest.fn();
            const newOnApprove = jest.fn();

            const { rerender } = renderHook(
                ({ onApprove }) =>
                    useVenmoOneTimePaymentSession({
                        presentationMode: "popup",
                        orderId: "test-order-id",
                        onApprove,
                    }),
                { initialProps: { onApprove: initialOnApprove } },
            );

            jest.clearAllMocks();

            rerender({ onApprove: newOnApprove });

            expect(mockVenmoSession.destroy).not.toHaveBeenCalled();
            expect(
                mockSdkInstance.createVenmoOneTimePaymentSession,
            ).not.toHaveBeenCalled();
        });
    });

    describe("handleClick", () => {
        test("should start session with presentation mode and orderId", async () => {
            const props: UseVenmoOneTimePaymentSessionProps = {
                presentationMode: "popup",
                orderId: "test-order-id",
                onApprove: jest.fn(),
                onCancel: jest.fn(),
                onError: jest.fn(),
            };

            const { result } = renderHook(() =>
                useVenmoOneTimePaymentSession(props),
            );

            await act(async () => {
                await result.current.handleClick();
            });

            expect(mockVenmoSession.start).toHaveBeenCalledWith({
                presentationMode: "popup",
            });
        });

        test("should start session with createOrder when provided", async () => {
            const mockCreateOrder = jest
                .fn()
                .mockReturnValue(Promise.resolve("created-order-id"));

            const props: UseVenmoOneTimePaymentSessionProps = {
                presentationMode: "popup",
                createOrder: mockCreateOrder,
                onApprove: jest.fn(),
                onCancel: jest.fn(),
                onError: jest.fn(),
            };

            const { result } = renderHook(() =>
                useVenmoOneTimePaymentSession(props),
            );

            await act(async () => {
                await result.current.handleClick();
            });

            expect(mockVenmoSession.start).toHaveBeenCalledWith(
                { presentationMode: "popup" },
                expect.any(Promise),
            );
            expect(mockCreateOrder).toHaveBeenCalled();
        });

        test("should do nothing if the click handler is called and the component has been unmounted", async () => {
            const props: UseVenmoOneTimePaymentSessionProps = {
                presentationMode: "popup",
                orderId: "test-order-id",
                onApprove: jest.fn(),
                onCancel: jest.fn(),
                onError: jest.fn(),
            };

            const { result, unmount } = renderHook(() =>
                useVenmoOneTimePaymentSession(props),
            );

            unmount();

            await act(async () => {
                await result.current.handleClick();
            });

            expect(result.current.error).toBeNull();
            expect(mockVenmoSession.start).not.toHaveBeenCalled();
        });

        test("should handle different presentation modes", async () => {
            const presentationModes = ["auto", "popup", "modal"] as const;

            for (const mode of presentationModes) {
                const props: UseVenmoOneTimePaymentSessionProps = {
                    presentationMode: mode,
                    orderId: "test-order-id",
                    onApprove: jest.fn(),
                    onCancel: jest.fn(),
                    onError: jest.fn(),
                };

                const { result } = renderHook(() =>
                    useVenmoOneTimePaymentSession(props),
                );

                await act(async () => {
                    await result.current.handleClick();
                });

                expect(mockVenmoSession.start).toHaveBeenCalledWith({
                    presentationMode: mode,
                });

                jest.clearAllMocks();
                mockVenmoSession = createMockVenmoSession();
                mockSdkInstance = createMockSdkInstance(mockVenmoSession);
                mockUsePayPal.mockReturnValue({
                    // @ts-expect-error mocking sdk instance
                    sdkInstance: mockSdkInstance,
                    loadingStatus: INSTANCE_LOADING_STATE.RESOLVED,
                    eligiblePaymentMethods: null,
                    error: null,
                });
            }
        });
    });

    describe("handleCancel", () => {
        test("should cancel session when available", () => {
            const props: UseVenmoOneTimePaymentSessionProps = {
                presentationMode: "popup",
                orderId: "test-order-id",
                onApprove: jest.fn(),
                onCancel: jest.fn(),
                onError: jest.fn(),
            };

            const { result } = renderHook(() =>
                useVenmoOneTimePaymentSession(props),
            );

            act(() => {
                result.current.handleCancel();
            });

            expect(mockVenmoSession.cancel).toHaveBeenCalled();
        });

        test("should not throw error when session is not available", () => {
            const props: UseVenmoOneTimePaymentSessionProps = {
                presentationMode: "popup",
                orderId: "test-order-id",
                onApprove: jest.fn(),
                onCancel: jest.fn(),
                onError: jest.fn(),
            };

            const { result, unmount } = renderHook(() =>
                useVenmoOneTimePaymentSession(props),
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
        test("should destroy session and clear reference", () => {
            const props: UseVenmoOneTimePaymentSessionProps = {
                presentationMode: "popup",
                orderId: "test-order-id",
                onApprove: jest.fn(),
                onCancel: jest.fn(),
                onError: jest.fn(),
            };

            const { result } = renderHook(() =>
                useVenmoOneTimePaymentSession(props),
            );

            act(() => {
                result.current.handleDestroy();
            });

            expect(mockVenmoSession.destroy).toHaveBeenCalled();
        });

        test("should not throw error when session is not available", () => {
            const props: UseVenmoOneTimePaymentSessionProps = {
                presentationMode: "popup",
                orderId: "test-order-id",
                onApprove: jest.fn(),
                onCancel: jest.fn(),
                onError: jest.fn(),
            };

            const { result, unmount } = renderHook(() =>
                useVenmoOneTimePaymentSession(props),
            );

            unmount();

            expect(() => {
                act(() => {
                    result.current.handleDestroy();
                });
            }).not.toThrow();
        });

        test("should handle manually destroyed session gracefully", async () => {
            const props: UseVenmoOneTimePaymentSessionProps = {
                presentationMode: "popup",
                orderId: "test-order-id",
                onApprove: jest.fn(),
                onCancel: jest.fn(),
                onError: jest.fn(),
            };

            const { result } = renderHook(() =>
                useVenmoOneTimePaymentSession(props),
            );

            act(() => {
                result.current.handleDestroy();
            });

            await act(async () => {
                await result.current.handleClick();
            });

            expect(result.current.error).toEqual(
                new Error("Venmo session not available"),
            );
        });
    });

    describe("callback proxying", () => {
        beforeEach(() => {
            mockUseProxyProps.mockImplementation(
                jest.requireActual("../utils").useProxyProps,
            );
        });

        test("should proxy callbacks correctly through useProxyProps", () => {
            const onApprove = jest.fn();
            const onCancel = jest.fn();
            const onError = jest.fn();

            const props: UseVenmoOneTimePaymentSessionProps = {
                presentationMode: "popup",
                orderId: "test-order-id",
                onApprove,
                onCancel,
                onError,
            };

            renderHook(() => useVenmoOneTimePaymentSession(props));

            const createSessionCall =
                mockSdkInstance.createVenmoOneTimePaymentSession.mock
                    .calls[0][0];

            expect(createSessionCall).toHaveProperty("onApprove");
            expect(createSessionCall).toHaveProperty("onCancel");
            expect(createSessionCall).toHaveProperty("onError");

            expect(createSessionCall.onApprove).not.toBe(onApprove);
            expect(createSessionCall.onCancel).not.toBe(onCancel);
            expect(createSessionCall.onError).not.toBe(onError);
        });
    });

    describe("return value stability", () => {
        test("should return stable function references", () => {
            const props: UseVenmoOneTimePaymentSessionProps = {
                presentationMode: "popup",
                orderId: "test-order-id",
                onApprove: jest.fn(),
                onCancel: jest.fn(),
                onError: jest.fn(),
            };

            const { result, rerender } = renderHook(() =>
                useVenmoOneTimePaymentSession(props),
            );

            const firstRender = {
                handleClick: result.current.handleClick,
                handleCancel: result.current.handleCancel,
                handleDestroy: result.current.handleDestroy,
            };

            rerender();

            const secondRender = {
                handleClick: result.current.handleClick,
                handleCancel: result.current.handleCancel,
                handleDestroy: result.current.handleDestroy,
            };

            expect(firstRender.handleClick).toBe(secondRender.handleClick);
            expect(firstRender.handleCancel).toBe(secondRender.handleCancel);
            expect(firstRender.handleDestroy).toBe(secondRender.handleDestroy);
        });
    });
});
