import { renderHook, act } from "@testing-library/react-hooks";

import { useVenmoOneTimePaymentSession } from "./useVenmoOneTimePaymentSession";
import { usePayPal } from "./usePayPal";
<<<<<<< HEAD
import { useProxyProps } from "../utils";
=======
>>>>>>> e579a5e (some cleanup)
import {
    INSTANCE_LOADING_STATE,
    type UseVenmoOneTimePaymentSessionProps,
    type VenmoOneTimePaymentSession,
} from "../types";

<<<<<<< HEAD
jest.mock("./usePayPal");

jest.mock("../utils", () => ({
    useProxyProps: jest.fn(),
}));

const mockUsePayPal = usePayPal as jest.MockedFunction<typeof usePayPal>;
const mockUseProxyProps = useProxyProps as jest.MockedFunction<
    typeof useProxyProps
>;

=======
// Mock the usePayPal hook
jest.mock("./usePayPal");

const mockUsePayPal = usePayPal as jest.MockedFunction<typeof usePayPal>;

// Mock VenmoOneTimePaymentSession
>>>>>>> e579a5e (some cleanup)
const createMockVenmoSession = (): VenmoOneTimePaymentSession => ({
    start: jest.fn().mockResolvedValue(undefined),
    cancel: jest.fn(),
    destroy: jest.fn(),
});

<<<<<<< HEAD
=======
// Mock SDK instance
>>>>>>> e579a5e (some cleanup)
const createMockSdkInstance = (venmoSession = createMockVenmoSession()) => ({
    createVenmoOneTimePaymentSession: jest.fn().mockReturnValue(venmoSession),
});

describe("useVenmoOneTimePaymentSession", () => {
    let mockVenmoSession: VenmoOneTimePaymentSession;
    let mockSdkInstance: ReturnType<typeof createMockSdkInstance>;

    beforeEach(() => {
<<<<<<< HEAD
        mockUseProxyProps.mockImplementation((callbacks) => callbacks);

=======
>>>>>>> e579a5e (some cleanup)
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
<<<<<<< HEAD
=======
        // ✅
>>>>>>> e579a5e (some cleanup)
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

<<<<<<< HEAD
            try {
                renderHook(() => useVenmoOneTimePaymentSession(props));
            } catch (error) {
                expect(error).toEqual(new Error("no sdk instance available"));
            }
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
=======
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
>>>>>>> e579a5e (some cleanup)
            };

            renderHook(() => useVenmoOneTimePaymentSession(props));

<<<<<<< HEAD
            const createSessionCall =
                mockSdkInstance.createVenmoOneTimePaymentSession.mock
                    .calls[0][0];

=======
>>>>>>> e579a5e (some cleanup)
            expect(
                mockSdkInstance.createVenmoOneTimePaymentSession,
            ).toHaveBeenCalledWith({
                orderId: "test-order-id",
<<<<<<< HEAD
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

=======
                onApprove: expect.any(Function),
                onCancel: expect.any(Function),
                onError: expect.any(Function),
            });
        });

        // ✅
>>>>>>> e579a5e (some cleanup)
        test("should create Venmo session without orderId when createOrder is provided", () => {
            const mockCreateOrder = jest
                .fn()
                .mockReturnValue(Promise.resolve("created-order-id"));
<<<<<<< HEAD
            const onApprove = jest.fn();
            const onCancel = jest.fn();
            const onError = jest.fn();
=======
>>>>>>> e579a5e (some cleanup)

            const props: UseVenmoOneTimePaymentSessionProps = {
                presentationMode: "popup",
                createOrder: mockCreateOrder,
<<<<<<< HEAD
                onApprove,
                onCancel,
                onError,
=======
                onApprove: jest.fn(),
                onCancel: jest.fn(),
                onError: jest.fn(),
>>>>>>> e579a5e (some cleanup)
            };

            renderHook(() => useVenmoOneTimePaymentSession(props));

<<<<<<< HEAD
            const createSessionCall =
                mockSdkInstance.createVenmoOneTimePaymentSession.mock
                    .calls[0][0];

=======
>>>>>>> e579a5e (some cleanup)
            expect(
                mockSdkInstance.createVenmoOneTimePaymentSession,
            ).toHaveBeenCalledWith({
                orderId: undefined,
<<<<<<< HEAD
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
=======
                onApprove: expect.any(Function),
                onCancel: expect.any(Function),
                onError: expect.any(Function),
            });
>>>>>>> e579a5e (some cleanup)
        });
    });

    describe("session lifecycle", () => {
        test("should destroy session on unmount", () => {
            const props: UseVenmoOneTimePaymentSessionProps = {
                presentationMode: "popup",
                orderId: "test-order-id",
<<<<<<< HEAD
                onApprove: jest.fn(),
                onCancel: jest.fn(),
                onError: jest.fn(),
=======
                onApprove: expect.any(Function),
                onCancel: expect.any(Function),
                onError: expect.any(Function),
>>>>>>> e579a5e (some cleanup)
            };

            const { unmount } = renderHook(() =>
                useVenmoOneTimePaymentSession(props),
            );

            unmount();

            expect(mockVenmoSession.destroy).toHaveBeenCalled();
        });

        test("should recreate session when orderId changes", () => {
<<<<<<< HEAD
            const onApprove = jest.fn();
            const onCancel = jest.fn();
            const onError = jest.fn();
=======
>>>>>>> e579a5e (some cleanup)
            const { rerender } = renderHook(
                ({ orderId }) =>
                    useVenmoOneTimePaymentSession({
                        presentationMode: "popup",
                        orderId,
<<<<<<< HEAD
                        onApprove,
                        onCancel,
                        onError,
=======
                        onApprove: expect.any(Function),
                        onCancel: expect.any(Function),
                        onError: expect.any(Function),
>>>>>>> e579a5e (some cleanup)
                    }),
                { initialProps: { orderId: "test-order-id-1" } },
            );

<<<<<<< HEAD
=======
            // Clear mock calls from initial render
>>>>>>> e579a5e (some cleanup)
            jest.clearAllMocks();

            rerender({ orderId: "test-order-id-2" });

            expect(mockVenmoSession.destroy).toHaveBeenCalled();
            expect(
                mockSdkInstance.createVenmoOneTimePaymentSession,
            ).toHaveBeenCalledWith({
                orderId: "test-order-id-2",
<<<<<<< HEAD
                onApprove,
                onCancel,
                onError,
=======
                onApprove: expect.any(Function),
                onCancel: expect.any(Function),
                onError: expect.any(Function),
>>>>>>> e579a5e (some cleanup)
            });
        });

        test("should recreate session when SDK instance changes", () => {
            const props: UseVenmoOneTimePaymentSessionProps = {
                presentationMode: "popup",
                orderId: "test-order-id",
<<<<<<< HEAD
                onApprove: jest.fn(),
                onCancel: jest.fn(),
                onError: jest.fn(),
=======
                onApprove: expect.any(Function),
                onCancel: expect.any(Function),
                onError: expect.any(Function),
>>>>>>> e579a5e (some cleanup)
            };

            const { rerender } = renderHook(() =>
                useVenmoOneTimePaymentSession(props),
            );

<<<<<<< HEAD
            jest.clearAllMocks();

=======
            // Clear mock calls from initial render
            jest.clearAllMocks();

            // Change SDK instance
>>>>>>> e579a5e (some cleanup)
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
<<<<<<< HEAD
            mockUseProxyProps.mockImplementation(
                jest.requireActual("../utils").useProxyProps,
            );

=======
>>>>>>> e579a5e (some cleanup)
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
<<<<<<< HEAD
                onApprove: jest.fn(),
                onCancel: jest.fn(),
                onError: jest.fn(),
=======
                onApprove: expect.any(Function),
                onCancel: expect.any(Function),
                onError: expect.any(Function),
>>>>>>> e579a5e (some cleanup)
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

<<<<<<< HEAD
=======
        // ✅
>>>>>>> e579a5e (some cleanup)
        test("should start session with createOrder when provided", async () => {
            const mockCreateOrder = jest
                .fn()
                .mockReturnValue(Promise.resolve("created-order-id"));

            const props: UseVenmoOneTimePaymentSessionProps = {
                presentationMode: "popup",
                createOrder: mockCreateOrder,
<<<<<<< HEAD
                onApprove: jest.fn(),
                onCancel: jest.fn(),
                onError: jest.fn(),
=======
                onApprove: expect.any(Function),
                onCancel: expect.any(Function),
                onError: expect.any(Function),
>>>>>>> e579a5e (some cleanup)
            };

            const { result } = renderHook(() =>
                useVenmoOneTimePaymentSession(props),
            );

            await act(async () => {
                await result.current.handleClick();
            });

<<<<<<< HEAD
            expect(mockVenmoSession.start).toHaveBeenCalledWith(
                { presentationMode: "popup" },
                expect.any(Promise),
=======
            // The hook calls createOrder() and passes the result as second argument to start()
            expect(mockVenmoSession.start).toHaveBeenCalledWith(
                { presentationMode: "popup" },
                expect.any(Promise), // createOrder() returns a Promise
>>>>>>> e579a5e (some cleanup)
            );
            expect(mockCreateOrder).toHaveBeenCalled();
        });

        test("should throw error when session is not available", async () => {
            const props: UseVenmoOneTimePaymentSessionProps = {
                presentationMode: "popup",
                orderId: "test-order-id",
<<<<<<< HEAD
                onApprove: jest.fn(),
                onCancel: jest.fn(),
                onError: jest.fn(),
=======
                onApprove: expect.any(Function),
                onCancel: expect.any(Function),
                onError: expect.any(Function),
>>>>>>> e579a5e (some cleanup)
            };

            const { result, unmount } = renderHook(() =>
                useVenmoOneTimePaymentSession(props),
            );

<<<<<<< HEAD
=======
            // Unmount to destroy session
>>>>>>> e579a5e (some cleanup)
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
<<<<<<< HEAD
                    onApprove: jest.fn(),
                    onCancel: jest.fn(),
                    onError: jest.fn(),
=======
                    onApprove: expect.any(Function),
                    onCancel: expect.any(Function),
                    onError: expect.any(Function),
>>>>>>> e579a5e (some cleanup)
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

<<<<<<< HEAD
=======
                // Clear for next iteration
>>>>>>> e579a5e (some cleanup)
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
<<<<<<< HEAD
=======
        // ✅
>>>>>>> e579a5e (some cleanup)
        test("should cancel session when available", () => {
            const props: UseVenmoOneTimePaymentSessionProps = {
                presentationMode: "popup",
                orderId: "test-order-id",
<<<<<<< HEAD
                onApprove: jest.fn(),
                onCancel: jest.fn(),
                onError: jest.fn(),
=======
                onApprove: expect.any(Function),
                onCancel: expect.any(Function),
                onError: expect.any(Function),
>>>>>>> e579a5e (some cleanup)
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
<<<<<<< HEAD
                onApprove: jest.fn(),
                onCancel: jest.fn(),
                onError: jest.fn(),
=======
                onApprove: expect.any(Function),
                onCancel: expect.any(Function),
                onError: expect.any(Function),
>>>>>>> e579a5e (some cleanup)
            };

            const { result, unmount } = renderHook(() =>
                useVenmoOneTimePaymentSession(props),
            );

<<<<<<< HEAD
=======
            // Unmount to destroy session
>>>>>>> e579a5e (some cleanup)
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
<<<<<<< HEAD
                onApprove: jest.fn(),
                onCancel: jest.fn(),
                onError: jest.fn(),
=======
                onApprove: expect.any(Function),
                onCancel: expect.any(Function),
                onError: expect.any(Function),
>>>>>>> e579a5e (some cleanup)
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
<<<<<<< HEAD
                onApprove: jest.fn(),
                onCancel: jest.fn(),
                onError: jest.fn(),
=======
                onApprove: expect.any(Function),
                onCancel: expect.any(Function),
                onError: expect.any(Function),
>>>>>>> e579a5e (some cleanup)
            };

            const { result, unmount } = renderHook(() =>
                useVenmoOneTimePaymentSession(props),
            );

<<<<<<< HEAD
=======
            // Unmount to destroy session
>>>>>>> e579a5e (some cleanup)
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
<<<<<<< HEAD
                onApprove: jest.fn(),
                onCancel: jest.fn(),
                onError: jest.fn(),
=======
                onApprove: expect.any(Function),
                onCancel: expect.any(Function),
                onError: expect.any(Function),
>>>>>>> e579a5e (some cleanup)
            };

            const { result } = renderHook(() =>
                useVenmoOneTimePaymentSession(props),
            );

<<<<<<< HEAD
=======
            // Destroy the session manually
>>>>>>> e579a5e (some cleanup)
            act(() => {
                result.current.handleDestroy();
            });

<<<<<<< HEAD
=======
            // Trying to click after manual destroy should throw
>>>>>>> e579a5e (some cleanup)
            await expect(
                act(async () => {
                    await result.current.handleClick();
                }),
            ).rejects.toThrow("Venmo session not available");
        });
    });

    describe("callback proxying", () => {
<<<<<<< HEAD
        beforeEach(() => {
            mockUseProxyProps.mockImplementation(
                jest.requireActual("../utils").useProxyProps,
            );
        });

=======
>>>>>>> e579a5e (some cleanup)
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
<<<<<<< HEAD
                onApprove: jest.fn(),
                onCancel: jest.fn(),
                onError: jest.fn(),
=======
                onApprove: expect.any(Function),
                onCancel: expect.any(Function),
                onError: expect.any(Function),
>>>>>>> e579a5e (some cleanup)
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

<<<<<<< HEAD
=======
            // Functions should be stable across re-renders
>>>>>>> e579a5e (some cleanup)
            expect(firstRender.handleClick).toBe(secondRender.handleClick);
            expect(firstRender.handleCancel).toBe(secondRender.handleCancel);
            expect(firstRender.handleDestroy).toBe(secondRender.handleDestroy);
        });
    });
});
