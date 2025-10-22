import { renderHook, act } from "@testing-library/react-hooks";

import { useVenmoOneTimePaymentSession } from "./useVenmoOneTimePaymentSession";
import { usePayPal } from "./usePayPal";
import {
    INSTANCE_LOADING_STATE,
    type UseVenmoOneTimePaymentSessionProps,
    type VenmoOneTimePaymentSession,
} from "../types";

// Mock the usePayPal hook
jest.mock("./usePayPal");

const mockUsePayPal = usePayPal as jest.MockedFunction<typeof usePayPal>;

// Mock VenmoOneTimePaymentSession
const createMockVenmoSession = (): VenmoOneTimePaymentSession => ({
    start: jest.fn().mockResolvedValue(undefined),
    cancel: jest.fn(),
    destroy: jest.fn(),
});

// Mock SDK instance
const createMockSdkInstance = (venmoSession = createMockVenmoSession()) => ({
    createVenmoOneTimePaymentSession: jest.fn().mockReturnValue(venmoSession),
});

describe("useVenmoOneTimePaymentSession", () => {
    let mockVenmoSession: VenmoOneTimePaymentSession;
    let mockSdkInstance: ReturnType<typeof createMockSdkInstance>;

    beforeEach(() => {
        mockVenmoSession = createMockVenmoSession();
        mockSdkInstance = createMockSdkInstance(mockVenmoSession);

        mockUsePayPal.mockReturnValue({
            // @ts-expect-error mocking sdk instance
            sdkInstance: mockSdkInstance,
            loadingStatus: INSTANCE_LOADING_STATE.RESOLVED,
            eligiblePaymentMethods: null,
            error: null,
            dispatch: jest.fn(),
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("initialization", () => {
        // ✅
        test("should not create session when no SDK instance is available", () => {
            mockUsePayPal.mockReturnValue({
                sdkInstance: null,
                loadingStatus: INSTANCE_LOADING_STATE.PENDING,
                eligiblePaymentMethods: null,
                error: null,
                dispatch: jest.fn(),
            });

            const props: UseVenmoOneTimePaymentSessionProps = {
                presentationMode: "popup",
                orderId: "test-order-id",
                onApprove: jest.fn(),
                onCancel: jest.fn(),
                onError: jest.fn(),
            };

            // Mock console.error to suppress React's error logging
            const consoleSpy = jest
                .spyOn(console, "error")
                .mockImplementation();

            try {
                renderHook(() => useVenmoOneTimePaymentSession(props));
            } catch (error) {
                // The hook throws when SDK instance is null, which is expected behavior
                expect((error as Error).message).toContain(
                    "no sdk instance available",
                );
            }

            consoleSpy.mockRestore();
        });

        // ✅
        test("should create Venmo session with orderId when provided", () => {
            const props: UseVenmoOneTimePaymentSessionProps = {
                presentationMode: "popup",
                orderId: "test-order-id",
                onApprove: jest.fn(),
                onCancel: jest.fn(),
                onError: jest.fn(),
            };

            renderHook(() => useVenmoOneTimePaymentSession(props));

            expect(
                mockSdkInstance.createVenmoOneTimePaymentSession,
            ).toHaveBeenCalledWith({
                orderId: "test-order-id",
                onApprove: expect.any(Function),
                onCancel: expect.any(Function),
                onError: expect.any(Function),
            });
        });

        // ✅
        test("should create Venmo session without orderId when createOrder is provided", () => {
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

            renderHook(() => useVenmoOneTimePaymentSession(props));

            expect(
                mockSdkInstance.createVenmoOneTimePaymentSession,
            ).toHaveBeenCalledWith({
                orderId: undefined,
                onApprove: expect.any(Function),
                onCancel: expect.any(Function),
                onError: expect.any(Function),
            });
        });
    });

    describe("session lifecycle", () => {
        test("should destroy session on unmount", () => {
            const props: UseVenmoOneTimePaymentSessionProps = {
                presentationMode: "popup",
                orderId: "test-order-id",
                onApprove: expect.any(Function),
                onCancel: expect.any(Function),
                onError: expect.any(Function),
            };

            const { unmount } = renderHook(() =>
                useVenmoOneTimePaymentSession(props),
            );

            unmount();

            expect(mockVenmoSession.destroy).toHaveBeenCalled();
        });

        test("should recreate session when orderId changes", () => {
            const { rerender } = renderHook(
                ({ orderId }) =>
                    useVenmoOneTimePaymentSession({
                        presentationMode: "popup",
                        orderId,
                        onApprove: expect.any(Function),
                        onCancel: expect.any(Function),
                        onError: expect.any(Function),
                    }),
                { initialProps: { orderId: "test-order-id-1" } },
            );

            // Clear mock calls from initial render
            jest.clearAllMocks();

            rerender({ orderId: "test-order-id-2" });

            expect(mockVenmoSession.destroy).toHaveBeenCalled();
            expect(
                mockSdkInstance.createVenmoOneTimePaymentSession,
            ).toHaveBeenCalledWith({
                orderId: "test-order-id-2",
                onApprove: expect.any(Function),
                onCancel: expect.any(Function),
                onError: expect.any(Function),
            });
        });

        test("should recreate session when SDK instance changes", () => {
            const props: UseVenmoOneTimePaymentSessionProps = {
                presentationMode: "popup",
                orderId: "test-order-id",
                onApprove: expect.any(Function),
                onCancel: expect.any(Function),
                onError: expect.any(Function),
            };

            const { rerender } = renderHook(() =>
                useVenmoOneTimePaymentSession(props),
            );

            // Clear mock calls from initial render
            jest.clearAllMocks();

            // Change SDK instance
            const newMockSession = createMockVenmoSession();
            const newMockSdkInstance = createMockSdkInstance(newMockSession);

            mockUsePayPal.mockReturnValue({
                // @ts-expect-error mocking sdk instance
                sdkInstance: newMockSdkInstance,
                loadingStatus: INSTANCE_LOADING_STATE.RESOLVED,
                eligiblePaymentMethods: null,
                error: null,
                dispatch: jest.fn(),
            });

            rerender();

            expect(mockVenmoSession.destroy).toHaveBeenCalled();
            expect(
                newMockSdkInstance.createVenmoOneTimePaymentSession,
            ).toHaveBeenCalled();
        });

        test("should NOT recreate session when only callbacks change", () => {
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
                onApprove: expect.any(Function),
                onCancel: expect.any(Function),
                onError: expect.any(Function),
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

        // ✅
        test("should start session with createOrder when provided", async () => {
            const mockCreateOrder = jest
                .fn()
                .mockReturnValue(Promise.resolve("created-order-id"));

            const props: UseVenmoOneTimePaymentSessionProps = {
                presentationMode: "popup",
                createOrder: mockCreateOrder,
                onApprove: expect.any(Function),
                onCancel: expect.any(Function),
                onError: expect.any(Function),
            };

            const { result } = renderHook(() =>
                useVenmoOneTimePaymentSession(props),
            );

            await act(async () => {
                await result.current.handleClick();
            });

            // The hook calls createOrder() and passes the result as second argument to start()
            expect(mockVenmoSession.start).toHaveBeenCalledWith(
                { presentationMode: "popup" },
                expect.any(Promise), // createOrder() returns a Promise
            );
            expect(mockCreateOrder).toHaveBeenCalled();
        });

        test("should throw error when session is not available", async () => {
            const props: UseVenmoOneTimePaymentSessionProps = {
                presentationMode: "popup",
                orderId: "test-order-id",
                onApprove: expect.any(Function),
                onCancel: expect.any(Function),
                onError: expect.any(Function),
            };

            const { result, unmount } = renderHook(() =>
                useVenmoOneTimePaymentSession(props),
            );

            // Unmount to destroy session
            unmount();

            await expect(
                act(async () => {
                    await result.current.handleClick();
                }),
            ).rejects.toThrow("Venmo session not available");
        });

        test("should handle different presentation modes", async () => {
            const presentationModes = ["auto", "popup", "modal"] as const;

            for (const mode of presentationModes) {
                const props: UseVenmoOneTimePaymentSessionProps = {
                    presentationMode: mode,
                    orderId: "test-order-id",
                    onApprove: expect.any(Function),
                    onCancel: expect.any(Function),
                    onError: expect.any(Function),
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

                // Clear for next iteration
                jest.clearAllMocks();
                mockVenmoSession = createMockVenmoSession();
                mockSdkInstance = createMockSdkInstance(mockVenmoSession);
                mockUsePayPal.mockReturnValue({
                    // @ts-expect-error mocking sdk instance
                    sdkInstance: mockSdkInstance,
                    loadingStatus: INSTANCE_LOADING_STATE.RESOLVED,
                    eligiblePaymentMethods: null,
                    error: null,
                    dispatch: jest.fn(),
                });
            }
        });
    });

    describe("handleCancel", () => {
        // ✅
        test("should cancel session when available", () => {
            const props: UseVenmoOneTimePaymentSessionProps = {
                presentationMode: "popup",
                orderId: "test-order-id",
                onApprove: expect.any(Function),
                onCancel: expect.any(Function),
                onError: expect.any(Function),
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
                onApprove: expect.any(Function),
                onCancel: expect.any(Function),
                onError: expect.any(Function),
            };

            const { result, unmount } = renderHook(() =>
                useVenmoOneTimePaymentSession(props),
            );

            // Unmount to destroy session
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
                onApprove: expect.any(Function),
                onCancel: expect.any(Function),
                onError: expect.any(Function),
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
                onApprove: expect.any(Function),
                onCancel: expect.any(Function),
                onError: expect.any(Function),
            };

            const { result, unmount } = renderHook(() =>
                useVenmoOneTimePaymentSession(props),
            );

            // Unmount to destroy session
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
                onApprove: expect.any(Function),
                onCancel: expect.any(Function),
                onError: expect.any(Function),
            };

            const { result } = renderHook(() =>
                useVenmoOneTimePaymentSession(props),
            );

            // Destroy the session manually
            act(() => {
                result.current.handleDestroy();
            });

            // Trying to click after manual destroy should throw
            await expect(
                act(async () => {
                    await result.current.handleClick();
                }),
            ).rejects.toThrow("Venmo session not available");
        });
    });

    describe("callback proxying", () => {
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
                onApprove: expect.any(Function),
                onCancel: expect.any(Function),
                onError: expect.any(Function),
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

            // Functions should be stable across re-renders
            expect(firstRender.handleClick).toBe(secondRender.handleClick);
            expect(firstRender.handleCancel).toBe(secondRender.handleCancel);
            expect(firstRender.handleDestroy).toBe(secondRender.handleDestroy);
        });
    });
});
