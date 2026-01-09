import { renderHook, act } from "@testing-library/react-hooks";

import { expectCurrentErrorValue } from "./useErrorTestUtil";
import { usePayPalSubscriptionPaymentSession } from "./usePayPalSubscriptionPaymentSession";
import { usePayPal } from "./usePayPal";
import { useProxyProps } from "../utils";
import {
    INSTANCE_LOADING_STATE,
    type PayPalSubscriptionPaymentSession,
} from "../types";

import type { UsePayPalSubscriptionPaymentSessionProps } from "./usePayPalSubscriptionPaymentSession";

jest.mock("./usePayPal");

jest.mock("../utils", () => ({
    useProxyProps: jest.fn(),
}));

const mockUsePayPal = usePayPal as jest.MockedFunction<typeof usePayPal>;
const mockUseProxyProps = useProxyProps as jest.MockedFunction<
    typeof useProxyProps
>;

const createMockPayPalSession = (): PayPalSubscriptionPaymentSession => ({
    start: jest.fn().mockResolvedValue(undefined),
    cancel: jest.fn(),
    destroy: jest.fn(),
});

const createMockSdkInstance = (paypalSession = createMockPayPalSession()) => ({
    createPayPalSubscriptionPaymentSession: jest
        .fn()
        .mockReturnValue(paypalSession),
});

describe("usePayPalSubscriptionPaymentSession", () => {
    let mockPayPalSession: PayPalSubscriptionPaymentSession;
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
            });

            const props: UsePayPalSubscriptionPaymentSessionProps = {
                presentationMode: "popup",
                createSubscription: jest.fn().mockResolvedValue({
                    subscriptionId: "test-subscription-id",
                }),
                onApprove: jest.fn(),
                onCancel: jest.fn(),
                onError: jest.fn(),
            };

            const {
                result: {
                    current: { error },
                },
            } = renderHook(() => usePayPalSubscriptionPaymentSession(props));

            expectCurrentErrorValue(error);

            expect(error).toEqual(new Error("no sdk instance available"));
            expect(
                mockSdkInstance.createPayPalSubscriptionPaymentSession,
            ).not.toHaveBeenCalled();
        });

        test("should not error if there is no sdkInstance but loading is still pending", () => {
            mockUsePayPal.mockReturnValue({
                sdkInstance: null,
                loadingStatus: INSTANCE_LOADING_STATE.PENDING,
                eligiblePaymentMethods: null,
                error: null,
            });

            const props: UsePayPalSubscriptionPaymentSessionProps = {
                presentationMode: "popup",
                createSubscription: jest.fn().mockResolvedValue({
                    subscriptionId: "test-subscription-id",
                }),
                onApprove: jest.fn(),
            };

            const {
                result: {
                    current: { error },
                },
            } = renderHook(() => usePayPalSubscriptionPaymentSession(props));

            expect(error).toBeNull();
        });

        test("should clear any sdkInstance related errors if the sdkInstance becomes available", () => {
            const mockSession = createMockPayPalSession();
            const mockSdkInstanceNew = createMockSdkInstance(mockSession);

            mockUsePayPal.mockReturnValue({
                sdkInstance: null,
                loadingStatus: INSTANCE_LOADING_STATE.REJECTED,
                eligiblePaymentMethods: null,
                error: null,
            });

            const props: UsePayPalSubscriptionPaymentSessionProps = {
                presentationMode: "popup",
                createSubscription: jest.fn().mockResolvedValue({
                    subscriptionId: "test-subscription-id",
                }),
                onApprove: jest.fn(),
            };

            const { result, rerender } = renderHook(() =>
                usePayPalSubscriptionPaymentSession(props),
            );

            expectCurrentErrorValue(result.current.error);
            expect(result.current.error).toEqual(
                new Error("no sdk instance available"),
            );

            mockUsePayPal.mockReturnValue({
                // @ts-expect-error mocking sdk instance
                sdkInstance: mockSdkInstanceNew,
                loadingStatus: INSTANCE_LOADING_STATE.RESOLVED,
                eligiblePaymentMethods: null,
                error: null,
            });

            rerender();

            expect(result.current.error).toBeNull();
        });

        test("should create a PayPal subscription session when the hook is called with callbacks", () => {
            const onApprove = jest.fn();
            const onCancel = jest.fn();
            const onError = jest.fn();
            const createSubscription = jest.fn().mockResolvedValue({
                subscriptionId: "test-subscription-id",
            });

            const props: UsePayPalSubscriptionPaymentSessionProps = {
                presentationMode: "popup",
                createSubscription,
                onApprove,
                onCancel,
                onError,
            };

            renderHook(() => usePayPalSubscriptionPaymentSession(props));

            const createSessionCall =
                mockSdkInstance.createPayPalSubscriptionPaymentSession.mock
                    .calls[0][0];

            expect(
                mockSdkInstance.createPayPalSubscriptionPaymentSession,
            ).toHaveBeenCalledWith({
                onApprove,
                onCancel,
                onError,
            });

            const mockData = { subscriptionId: "test-subscription-id" };
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
            const props: UsePayPalSubscriptionPaymentSessionProps = {
                presentationMode: "popup",
                createSubscription: jest.fn().mockResolvedValue({
                    subscriptionId: "test-subscription-id",
                }),
                onApprove: jest.fn(),
                onCancel: jest.fn(),
                onError: jest.fn(),
            };

            const { unmount } = renderHook(() =>
                usePayPalSubscriptionPaymentSession(props),
            );

            unmount();

            expect(mockPayPalSession.destroy).toHaveBeenCalled();
        });

        test("should destroy the previous session when the hook re-runs with a new sdkInstance", () => {
            const props: UsePayPalSubscriptionPaymentSessionProps = {
                presentationMode: "popup",
                createSubscription: jest.fn().mockResolvedValue({
                    subscriptionId: "test-subscription-id",
                }),
                onApprove: jest.fn(),
                onCancel: jest.fn(),
                onError: jest.fn(),
            };

            const { rerender } = renderHook(() =>
                usePayPalSubscriptionPaymentSession(props),
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
            });

            rerender();

            expect(mockPayPalSession.destroy).toHaveBeenCalled();
            expect(
                newMockSdkInstance.createPayPalSubscriptionPaymentSession,
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
                    usePayPalSubscriptionPaymentSession({
                        presentationMode: "popup",
                        createSubscription: jest.fn().mockResolvedValue({
                            subscriptionId: "test-subscription-id",
                        }),
                        onApprove,
                    }),
                { initialProps: { onApprove: initialOnApprove } },
            );

            jest.clearAllMocks();

            rerender({ onApprove: newOnApprove });

            expect(mockPayPalSession.destroy).not.toHaveBeenCalled();
            expect(
                mockSdkInstance.createPayPalSubscriptionPaymentSession,
            ).not.toHaveBeenCalled();
        });
    });

    describe("handleClick", () => {
        test("should provide a click handler that calls session start with presentation mode", async () => {
            const subscriptionPromise = Promise.resolve({
                subscriptionId: "test-subscription-id",
            });
            const createSubscription = jest
                .fn()
                .mockReturnValue(subscriptionPromise);

            const props: UsePayPalSubscriptionPaymentSessionProps = {
                presentationMode: "popup",
                createSubscription,
                onApprove: jest.fn(),
                onCancel: jest.fn(),
                onError: jest.fn(),
            };

            const { result } = renderHook(() =>
                usePayPalSubscriptionPaymentSession(props),
            );

            await act(async () => {
                await result.current.handleClick();
            });

            expect(mockPayPalSession.start).toHaveBeenCalledWith(
                {
                    presentationMode: "popup",
                    fullPageOverlay: undefined,
                },
                subscriptionPromise,
            );
        });

        test("should pass createSubscription promise to session.start()", async () => {
            const subscriptionPromise = Promise.resolve({
                subscriptionId: "test-subscription-id",
            });
            const createSubscription = jest
                .fn()
                .mockReturnValue(subscriptionPromise);

            const props: UsePayPalSubscriptionPaymentSessionProps = {
                presentationMode: "popup",
                createSubscription,
                onApprove: jest.fn(),
            };

            const { result } = renderHook(() =>
                usePayPalSubscriptionPaymentSession(props),
            );

            await act(async () => {
                await result.current.handleClick();
            });

            expect(createSubscription).toHaveBeenCalled();
            expect(mockPayPalSession.start).toHaveBeenCalledWith(
                expect.any(Object),
                subscriptionPromise,
            );
        });

        test("should do nothing if the click handler is called and there is no session", async () => {
            const props: UsePayPalSubscriptionPaymentSessionProps = {
                presentationMode: "popup",
                createSubscription: jest.fn().mockResolvedValue({
                    subscriptionId: "test-subscription-id",
                }),
                onApprove: jest.fn(),
                onCancel: jest.fn(),
                onError: jest.fn(),
            };

            const { result, unmount } = renderHook(() =>
                usePayPalSubscriptionPaymentSession(props),
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
            const presentationModes = [
                "auto",
                "popup",
                "modal",
                "payment-handler",
            ] as const;

            for (const mode of presentationModes) {
                const subscriptionPromise = Promise.resolve({
                    subscriptionId: "test-subscription-id",
                });
                const props: UsePayPalSubscriptionPaymentSessionProps = {
                    presentationMode: mode,
                    createSubscription: jest
                        .fn()
                        .mockReturnValue(subscriptionPromise),
                    onApprove: jest.fn(),
                    onCancel: jest.fn(),
                    onError: jest.fn(),
                };

                const { result } = renderHook(() =>
                    usePayPalSubscriptionPaymentSession(props),
                );

                await act(async () => {
                    await result.current.handleClick();
                });

                expect(mockPayPalSession.start).toHaveBeenCalledWith(
                    {
                        presentationMode: mode,
                        fullPageOverlay: undefined,
                    },
                    subscriptionPromise,
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
                });
            }
        });

        test("should pass fullPageOverlay option when provided", async () => {
            const subscriptionPromise = Promise.resolve({
                subscriptionId: "test-subscription-id",
            });
            const props: UsePayPalSubscriptionPaymentSessionProps = {
                presentationMode: "popup",
                fullPageOverlay: { enabled: true },
                createSubscription: jest
                    .fn()
                    .mockReturnValue(subscriptionPromise),
                onApprove: jest.fn(),
            };

            const { result } = renderHook(() =>
                usePayPalSubscriptionPaymentSession(props),
            );

            await act(async () => {
                await result.current.handleClick();
            });

            expect(mockPayPalSession.start).toHaveBeenCalledWith(
                {
                    presentationMode: "popup",
                    fullPageOverlay: { enabled: true },
                },
                subscriptionPromise,
            );
        });
    });

    describe("handleCancel", () => {
        test("should provide a cancel handler that cancels the session", () => {
            const props: UsePayPalSubscriptionPaymentSessionProps = {
                presentationMode: "popup",
                createSubscription: jest.fn().mockResolvedValue({
                    subscriptionId: "test-subscription-id",
                }),
                onApprove: jest.fn(),
                onCancel: jest.fn(),
                onError: jest.fn(),
            };

            const { result } = renderHook(() =>
                usePayPalSubscriptionPaymentSession(props),
            );

            act(() => {
                result.current.handleCancel();
            });

            expect(mockPayPalSession.cancel).toHaveBeenCalled();
        });

        test("should not throw error when session is not available", () => {
            const props: UsePayPalSubscriptionPaymentSessionProps = {
                presentationMode: "popup",
                createSubscription: jest.fn().mockResolvedValue({
                    subscriptionId: "test-subscription-id",
                }),
                onApprove: jest.fn(),
                onCancel: jest.fn(),
                onError: jest.fn(),
            };

            const { result, unmount } = renderHook(() =>
                usePayPalSubscriptionPaymentSession(props),
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
            const props: UsePayPalSubscriptionPaymentSessionProps = {
                presentationMode: "popup",
                createSubscription: jest.fn().mockResolvedValue({
                    subscriptionId: "test-subscription-id",
                }),
                onApprove: jest.fn(),
                onCancel: jest.fn(),
                onError: jest.fn(),
            };

            const { result } = renderHook(() =>
                usePayPalSubscriptionPaymentSession(props),
            );

            act(() => {
                result.current.handleDestroy();
            });

            expect(mockPayPalSession.destroy).toHaveBeenCalled();
        });

        test("should not throw error when session is not available", () => {
            const props: UsePayPalSubscriptionPaymentSessionProps = {
                presentationMode: "popup",
                createSubscription: jest.fn().mockResolvedValue({
                    subscriptionId: "test-subscription-id",
                }),
                onApprove: jest.fn(),
                onCancel: jest.fn(),
                onError: jest.fn(),
            };

            const { result, unmount } = renderHook(() =>
                usePayPalSubscriptionPaymentSession(props),
            );

            unmount();

            expect(() => {
                act(() => {
                    result.current.handleDestroy();
                });
            }).not.toThrow();
        });

        test("should handle manually destroyed session gracefully", async () => {
            const props: UsePayPalSubscriptionPaymentSessionProps = {
                presentationMode: "popup",
                createSubscription: jest.fn().mockResolvedValue({
                    subscriptionId: "test-subscription-id",
                }),
                onApprove: jest.fn(),
                onCancel: jest.fn(),
                onError: jest.fn(),
            };

            const { result } = renderHook(() =>
                usePayPalSubscriptionPaymentSession(props),
            );

            act(() => {
                result.current.handleDestroy();
            });

            await act(async () => {
                await result.current.handleClick();
            });

            const { error } = result.current;

            expectCurrentErrorValue(error);

            expect(error).toEqual(
                new Error("PayPal subscription session not available"),
            );
        });
    });
});
