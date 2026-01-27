import { renderHook, act } from "@testing-library/react-hooks";

import { expectCurrentErrorValue } from "./useErrorTestUtil";
import { usePayPalCreditSavePaymentSession } from "./usePayPalCreditSavePaymentSession";
import { usePayPal } from "./usePayPal";
import { useProxyProps } from "../utils";
import { INSTANCE_LOADING_STATE, type SavePaymentSession } from "../types";

import type { UsePayPalCreditSavePaymentSessionProps } from "./usePayPalCreditSavePaymentSession";

jest.mock("./usePayPal");

jest.mock("../utils", () => ({
    useProxyProps: jest.fn(),
}));

const mockUsePayPal = usePayPal as jest.MockedFunction<typeof usePayPal>;
const mockUseProxyProps = useProxyProps as jest.MockedFunction<
    typeof useProxyProps
>;

const createMockSavePaymentSession = (): SavePaymentSession => ({
    start: jest.fn().mockResolvedValue(undefined),
    cancel: jest.fn(),
    destroy: jest.fn(),
    hasReturned: jest.fn().mockReturnValue(false),
    resume: jest.fn().mockResolvedValue(undefined),
});

const createMockSdkInstance = (
    savePaymentSession = createMockSavePaymentSession(),
) => ({
    createPayPalSavePaymentSession: jest
        .fn()
        .mockReturnValue(savePaymentSession),
});

describe("usePayPalCreditSavePaymentSession", () => {
    let mockSavePaymentSession: SavePaymentSession;
    let mockSdkInstance: ReturnType<typeof createMockSdkInstance>;

    beforeEach(() => {
        mockUseProxyProps.mockImplementation((callbacks) => callbacks);

        mockSavePaymentSession = createMockSavePaymentSession();
        mockSdkInstance = createMockSdkInstance(mockSavePaymentSession);

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

            const props: UsePayPalCreditSavePaymentSessionProps = {
                presentationMode: "popup",
                vaultSetupToken: "test-vault-token",
                onApprove: jest.fn(),
                onCancel: jest.fn(),
                onError: jest.fn(),
            };

            const {
                result: {
                    current: { error },
                },
            } = renderHook(() => usePayPalCreditSavePaymentSession(props));

            expectCurrentErrorValue(error);

            expect(error).toEqual(new Error("no sdk instance available"));
            expect(
                mockSdkInstance.createPayPalSavePaymentSession,
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

            const props: UsePayPalCreditSavePaymentSessionProps = {
                presentationMode: "popup",
                vaultSetupToken: "test-vault-token",
                onApprove: jest.fn(),
            };

            const {
                result: {
                    current: { error },
                },
            } = renderHook(() => usePayPalCreditSavePaymentSession(props));

            expect(error).toBeNull();
        });

        test("should clear any sdkInstance related errors if the sdkInstance becomes available", () => {
            const mockSession = createMockSavePaymentSession();
            const mockSdkInstanceNew = createMockSdkInstance(mockSession);

            mockUsePayPal.mockReturnValue({
                sdkInstance: null,
                loadingStatus: INSTANCE_LOADING_STATE.REJECTED,
                eligiblePaymentMethods: null,
                error: null,
                isHydrated: true,
            });

            const props: UsePayPalCreditSavePaymentSessionProps = {
                presentationMode: "popup",
                vaultSetupToken: "test-vault-token",
                onApprove: jest.fn(),
            };

            const { result, rerender } = renderHook(() =>
                usePayPalCreditSavePaymentSession(props),
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

                const props: UsePayPalCreditSavePaymentSessionProps = {
                    presentationMode: "popup",
                    vaultSetupToken: "test-vault-token",
                    onApprove: jest.fn(),
                };

                const { result } = renderHook(() =>
                    usePayPalCreditSavePaymentSession(props),
                );

                expect(result.current.isPending).toBe(expectedIsPending);
            },
        );

        test("should create a PayPal save payment session when called with vaultSetupToken", () => {
            const onApprove = jest.fn();
            const onCancel = jest.fn();
            const onError = jest.fn();

            const props: UsePayPalCreditSavePaymentSessionProps = {
                presentationMode: "popup",
                vaultSetupToken: "test-vault-token",
                onApprove,
                onCancel,
                onError,
            };

            renderHook(() => usePayPalCreditSavePaymentSession(props));

            const createSessionCall =
                mockSdkInstance.createPayPalSavePaymentSession.mock.calls[0][0];

            expect(
                mockSdkInstance.createPayPalSavePaymentSession,
            ).toHaveBeenCalledWith({
                vaultSetupToken: "test-vault-token",
                onApprove,
                onCancel,
                onError,
            });

            const mockData = { vaultSetupToken: "test-vault-token" };
            createSessionCall.onApprove(mockData);
            createSessionCall.onCancel();
            createSessionCall.onError(new Error("test error"));

            expect(onApprove).toHaveBeenCalledWith(mockData);
            expect(onCancel).toHaveBeenCalled();
            expect(onError).toHaveBeenCalledWith(new Error("test error"));
        });

        test("should create a PayPal save payment session without vaultSetupToken when createVaultToken callback is provided", () => {
            const mockCreateVaultToken = jest
                .fn()
                .mockReturnValue(
                    Promise.resolve({ vaultSetupToken: "created-vault-token" }),
                );
            const onApprove = jest.fn();
            const onCancel = jest.fn();
            const onError = jest.fn();

            const props: UsePayPalCreditSavePaymentSessionProps = {
                presentationMode: "popup",
                createVaultToken: mockCreateVaultToken,
                onApprove,
                onCancel,
                onError,
            };

            renderHook(() => usePayPalCreditSavePaymentSession(props));

            const createSessionCall =
                mockSdkInstance.createPayPalSavePaymentSession.mock.calls[0][0];

            expect(
                mockSdkInstance.createPayPalSavePaymentSession,
            ).toHaveBeenCalledWith({
                vaultSetupToken: undefined,
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
            const props: UsePayPalCreditSavePaymentSessionProps = {
                presentationMode: "popup",
                vaultSetupToken: "test-vault-token",
                onApprove: jest.fn(),
                onCancel: jest.fn(),
                onError: jest.fn(),
            };

            const { unmount } = renderHook(() =>
                usePayPalCreditSavePaymentSession(props),
            );

            unmount();

            expect(mockSavePaymentSession.destroy).toHaveBeenCalled();
        });

        test("should destroy the previous session when the hook re-runs with a new vaultSetupToken", () => {
            const onApprove = jest.fn();
            const onCancel = jest.fn();
            const onError = jest.fn();
            const { rerender } = renderHook(
                ({ vaultSetupToken }) =>
                    usePayPalCreditSavePaymentSession({
                        presentationMode: "popup",
                        vaultSetupToken,
                        onApprove,
                        onCancel,
                        onError,
                    }),
                { initialProps: { vaultSetupToken: "test-vault-token-1" } },
            );

            jest.clearAllMocks();

            rerender({ vaultSetupToken: "test-vault-token-2" });

            expect(mockSavePaymentSession.destroy).toHaveBeenCalled();
            expect(
                mockSdkInstance.createPayPalSavePaymentSession,
            ).toHaveBeenCalledWith({
                vaultSetupToken: "test-vault-token-2",
                onApprove,
                onCancel,
                onError,
            });
        });

        test("should destroy the previous session when the hook re-runs with a new sdkInstance", () => {
            const props: UsePayPalCreditSavePaymentSessionProps = {
                presentationMode: "popup",
                vaultSetupToken: "test-vault-token",
                onApprove: jest.fn(),
                onCancel: jest.fn(),
                onError: jest.fn(),
            };

            const { rerender } = renderHook(() =>
                usePayPalCreditSavePaymentSession(props),
            );

            jest.clearAllMocks();

            const newMockSession = createMockSavePaymentSession();
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

            expect(mockSavePaymentSession.destroy).toHaveBeenCalled();
            expect(
                newMockSdkInstance.createPayPalSavePaymentSession,
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
                    usePayPalCreditSavePaymentSession({
                        presentationMode: "popup",
                        vaultSetupToken: "test-vault-token",
                        onApprove,
                    }),
                { initialProps: { onApprove: initialOnApprove } },
            );

            jest.clearAllMocks();

            rerender({ onApprove: newOnApprove });

            expect(mockSavePaymentSession.destroy).not.toHaveBeenCalled();
            expect(
                mockSdkInstance.createPayPalSavePaymentSession,
            ).not.toHaveBeenCalled();
        });
    });

    describe("resume flow", () => {
        test("should check hasReturned and call resume when presentationMode is redirect", async () => {
            const mockSession = createMockSavePaymentSession();
            (mockSession.hasReturned as jest.Mock).mockReturnValue(true);
            const mockSdk = createMockSdkInstance(mockSession);

            mockUsePayPal.mockReturnValue({
                // @ts-expect-error mocking sdk instance
                sdkInstance: mockSdk,
                loadingStatus: INSTANCE_LOADING_STATE.RESOLVED,
                eligiblePaymentMethods: null,
                error: null,
                isHydrated: true,
            });

            const props: UsePayPalCreditSavePaymentSessionProps = {
                presentationMode: "redirect",
                vaultSetupToken: "test-vault-token",
                onApprove: jest.fn(),
            };

            await act(async () => {
                renderHook(() => usePayPalCreditSavePaymentSession(props));
            });

            expect(mockSession.hasReturned).toHaveBeenCalled();
            expect(mockSession.resume).toHaveBeenCalled();
        });

        test("should check hasReturned and call resume when presentationMode is direct-app-switch", async () => {
            const mockSession = createMockSavePaymentSession();
            (mockSession.hasReturned as jest.Mock).mockReturnValue(true);
            const mockSdk = createMockSdkInstance(mockSession);

            mockUsePayPal.mockReturnValue({
                // @ts-expect-error mocking sdk instance
                sdkInstance: mockSdk,
                loadingStatus: INSTANCE_LOADING_STATE.RESOLVED,
                eligiblePaymentMethods: null,
                error: null,
                isHydrated: true,
            });

            const props: UsePayPalCreditSavePaymentSessionProps = {
                presentationMode: "direct-app-switch",
                vaultSetupToken: "test-vault-token",
                onApprove: jest.fn(),
            };

            await act(async () => {
                renderHook(() => usePayPalCreditSavePaymentSession(props));
            });

            expect(mockSession.hasReturned).toHaveBeenCalled();
            expect(mockSession.resume).toHaveBeenCalled();
        });

        test("should not call resume if hasReturned returns false", async () => {
            const mockSession = createMockSavePaymentSession();
            (mockSession.hasReturned as jest.Mock).mockReturnValue(false);
            const mockSdk = createMockSdkInstance(mockSession);

            mockUsePayPal.mockReturnValue({
                // @ts-expect-error mocking sdk instance
                sdkInstance: mockSdk,
                loadingStatus: INSTANCE_LOADING_STATE.RESOLVED,
                eligiblePaymentMethods: null,
                error: null,
                isHydrated: true,
            });

            const props: UsePayPalCreditSavePaymentSessionProps = {
                presentationMode: "redirect",
                vaultSetupToken: "test-vault-token",
                onApprove: jest.fn(),
            };

            await act(async () => {
                renderHook(() => usePayPalCreditSavePaymentSession(props));
            });

            expect(mockSession.hasReturned).toHaveBeenCalled();
            expect(mockSession.resume).not.toHaveBeenCalled();
        });

        test("should NOT check hasReturned when presentationMode is popup", () => {
            const props: UsePayPalCreditSavePaymentSessionProps = {
                presentationMode: "popup",
                vaultSetupToken: "test-vault-token",
                onApprove: jest.fn(),
            };

            renderHook(() => usePayPalCreditSavePaymentSession(props));

            expect(mockSavePaymentSession.hasReturned).not.toHaveBeenCalled();
            expect(mockSavePaymentSession.resume).not.toHaveBeenCalled();
        });

        test("should handle errors during resume flow", async () => {
            const mockSession = createMockSavePaymentSession();
            const resumeError = new Error("resume failed");
            (mockSession.hasReturned as jest.Mock).mockReturnValue(true);
            (mockSession.resume as jest.Mock).mockRejectedValue(resumeError);
            const mockSdk = createMockSdkInstance(mockSession);

            mockUsePayPal.mockReturnValue({
                // @ts-expect-error mocking sdk instance
                sdkInstance: mockSdk,
                loadingStatus: INSTANCE_LOADING_STATE.RESOLVED,
                eligiblePaymentMethods: null,
                error: null,
                isHydrated: true,
            });

            const props: UsePayPalCreditSavePaymentSessionProps = {
                presentationMode: "redirect",
                vaultSetupToken: "test-vault-token",
                onApprove: jest.fn(),
            };

            await act(async () => {
                renderHook(() => usePayPalCreditSavePaymentSession(props));
                await Promise.resolve();
            });

            expect(mockSession.resume).toHaveBeenCalled();
        });
    });

    describe("handleClick", () => {
        test("should provide a click handler that calls session start with presentation mode", async () => {
            const props: UsePayPalCreditSavePaymentSessionProps = {
                presentationMode: "popup",
                vaultSetupToken: "test-vault-token",
                onApprove: jest.fn(),
                onCancel: jest.fn(),
                onError: jest.fn(),
            };

            const { result } = renderHook(() =>
                usePayPalCreditSavePaymentSession(props),
            );

            await act(async () => {
                await result.current.handleClick();
            });

            expect(mockSavePaymentSession.start).toHaveBeenCalledWith({
                presentationMode: "popup",
                fullPageOverlay: undefined,
                autoRedirect: undefined,
            });
        });

        test("should call the createVaultToken callback on start inside the click handler", async () => {
            const mockCreateVaultToken = jest
                .fn()
                .mockReturnValue(
                    Promise.resolve({ vaultSetupToken: "created-vault-token" }),
                );

            const props: UsePayPalCreditSavePaymentSessionProps = {
                presentationMode: "popup",
                createVaultToken: mockCreateVaultToken,
                onApprove: jest.fn(),
                onCancel: jest.fn(),
                onError: jest.fn(),
            };

            const { result } = renderHook(() =>
                usePayPalCreditSavePaymentSession(props),
            );

            await act(async () => {
                await result.current.handleClick();
            });

            expect(mockSavePaymentSession.start).toHaveBeenCalledWith(
                {
                    presentationMode: "popup",
                    fullPageOverlay: undefined,
                    autoRedirect: undefined,
                },
                expect.any(Promise),
            );
            expect(mockCreateVaultToken).toHaveBeenCalled();
        });

        test("should do nothing if the click handler is called and there is no session", async () => {
            const props: UsePayPalCreditSavePaymentSessionProps = {
                presentationMode: "popup",
                vaultSetupToken: "test-vault-token",
                onApprove: jest.fn(),
                onCancel: jest.fn(),
                onError: jest.fn(),
            };

            const { result, unmount } = renderHook(() =>
                usePayPalCreditSavePaymentSession(props),
            );

            unmount();

            await act(async () => {
                await result.current.handleClick();
            });

            const { error } = result.current;

            expectCurrentErrorValue(error);

            expect(error).toBeNull();
            expect(mockSavePaymentSession.start).not.toHaveBeenCalled();
        });

        test("should handle different presentation modes", async () => {
            const presentationModes = [
                "auto",
                "popup",
                "modal",
                "redirect",
                "direct-app-switch",
            ] as const;

            for (const mode of presentationModes) {
                const props: UsePayPalCreditSavePaymentSessionProps = {
                    presentationMode: mode,
                    vaultSetupToken: "test-vault-token",
                    onApprove: jest.fn(),
                    onCancel: jest.fn(),
                    onError: jest.fn(),
                };

                const { result } = renderHook(() =>
                    usePayPalCreditSavePaymentSession(props),
                );

                await act(async () => {
                    await result.current.handleClick();
                });

                expect(mockSavePaymentSession.start).toHaveBeenCalledWith({
                    presentationMode: mode,
                    fullPageOverlay: undefined,
                    autoRedirect: undefined,
                });

                jest.clearAllMocks();
                mockSavePaymentSession = createMockSavePaymentSession();
                mockSdkInstance = createMockSdkInstance(mockSavePaymentSession);
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

        test("should pass autoRedirect option when specified", async () => {
            const props: UsePayPalCreditSavePaymentSessionProps = {
                presentationMode: "redirect",
                vaultSetupToken: "test-vault-token",
                autoRedirect: { enabled: true },
                onApprove: jest.fn(),
            };

            const { result } = renderHook(() =>
                usePayPalCreditSavePaymentSession(props),
            );

            await act(async () => {
                await result.current.handleClick();
            });

            expect(mockSavePaymentSession.start).toHaveBeenCalledWith({
                presentationMode: "redirect",
                fullPageOverlay: undefined,
                autoRedirect: { enabled: true },
            });
        });

        test("should pass fullPageOverlay option when specified", async () => {
            const props: UsePayPalCreditSavePaymentSessionProps = {
                presentationMode: "popup",
                vaultSetupToken: "test-vault-token",
                fullPageOverlay: { enabled: true },
                onApprove: jest.fn(),
            };

            const { result } = renderHook(() =>
                usePayPalCreditSavePaymentSession(props),
            );

            await act(async () => {
                await result.current.handleClick();
            });

            expect(mockSavePaymentSession.start).toHaveBeenCalledWith({
                presentationMode: "popup",
                fullPageOverlay: { enabled: true },
                autoRedirect: undefined,
            });
        });
    });

    describe("handleCancel", () => {
        test("should provide a cancel handler that cancels the session", () => {
            const props: UsePayPalCreditSavePaymentSessionProps = {
                presentationMode: "popup",
                vaultSetupToken: "test-vault-token",
                onApprove: jest.fn(),
                onCancel: jest.fn(),
                onError: jest.fn(),
            };

            const { result } = renderHook(() =>
                usePayPalCreditSavePaymentSession(props),
            );

            act(() => {
                result.current.handleCancel();
            });

            expect(mockSavePaymentSession.cancel).toHaveBeenCalled();
        });

        test("should not throw error when session is not available", () => {
            const props: UsePayPalCreditSavePaymentSessionProps = {
                presentationMode: "popup",
                vaultSetupToken: "test-vault-token",
                onApprove: jest.fn(),
                onCancel: jest.fn(),
                onError: jest.fn(),
            };

            const { result, unmount } = renderHook(() =>
                usePayPalCreditSavePaymentSession(props),
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
            const props: UsePayPalCreditSavePaymentSessionProps = {
                presentationMode: "popup",
                vaultSetupToken: "test-vault-token",
                onApprove: jest.fn(),
                onCancel: jest.fn(),
                onError: jest.fn(),
            };

            const { result } = renderHook(() =>
                usePayPalCreditSavePaymentSession(props),
            );

            act(() => {
                result.current.handleDestroy();
            });

            expect(mockSavePaymentSession.destroy).toHaveBeenCalled();
        });

        test("should not throw error when session is not available", () => {
            const props: UsePayPalCreditSavePaymentSessionProps = {
                presentationMode: "popup",
                vaultSetupToken: "test-vault-token",
                onApprove: jest.fn(),
                onCancel: jest.fn(),
                onError: jest.fn(),
            };

            const { result, unmount } = renderHook(() =>
                usePayPalCreditSavePaymentSession(props),
            );

            unmount();

            expect(() => {
                act(() => {
                    result.current.handleDestroy();
                });
            }).not.toThrow();
        });

        test("should handle manually destroyed session gracefully", async () => {
            const props: UsePayPalCreditSavePaymentSessionProps = {
                presentationMode: "popup",
                vaultSetupToken: "test-vault-token",
                onApprove: jest.fn(),
                onCancel: jest.fn(),
                onError: jest.fn(),
            };

            const { result } = renderHook(() =>
                usePayPalCreditSavePaymentSession(props),
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
                new Error("Credit Save Payment session not available"),
            );
        });
    });
});
