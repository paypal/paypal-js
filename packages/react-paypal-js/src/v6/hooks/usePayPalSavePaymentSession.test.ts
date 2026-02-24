import { act, renderHook } from "@testing-library/react-hooks";

import { expectCurrentErrorValue } from "./useErrorTestUtil";
import { usePayPal } from "./usePayPal";
import { usePayPalSavePaymentSession } from "./usePayPalSavePaymentSession";
import { useProxyProps } from "../utils";
import { INSTANCE_LOADING_STATE } from "../types/PayPalProviderEnums";

import type { SavePaymentSession } from "../types";

jest.mock("./usePayPal", () => ({
    usePayPal: jest.fn(),
}));

jest.mock("../utils", () => ({
    ...jest.requireActual("../utils"),
    useProxyProps: jest.fn(),
}));

describe("usePayPalSavePaymentSession", () => {
    beforeEach(() => {
        // mocking this for each test rather than a module so it can be easily unmocked
        // where needed
        (useProxyProps as jest.Mock).mockImplementation(
            (callbacks) => callbacks,
        );
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test("should create a PayPal save payment session when the hook is called with vaultSetupToken", () => {
        const mockVaultSetupToken = "vault-setup-token-123";
        const mockOnApprove = jest.fn();
        const mockOnCancel = jest.fn();
        const mockOnError = jest.fn();
        const mockStart = jest.fn();
        const mockSession: SavePaymentSession = {
            cancel: jest.fn(),
            destroy: jest.fn(),
            start: mockStart,
        };
        const mockCreatePayPalSavePaymentSession = jest
            .fn()
            .mockReturnValue(mockSession);

        (usePayPal as jest.Mock).mockReturnValue({
            sdkInstance: {
                createPayPalSavePaymentSession:
                    mockCreatePayPalSavePaymentSession,
            },
        });

        renderHook(() =>
            usePayPalSavePaymentSession({
                presentationMode: "auto",
                vaultSetupToken: mockVaultSetupToken,
                onApprove: mockOnApprove,
                onCancel: mockOnCancel,
                onError: mockOnError,
            }),
        );

        expect(mockCreatePayPalSavePaymentSession).toHaveBeenCalledTimes(1);
        expect(mockCreatePayPalSavePaymentSession).toHaveBeenCalledWith({
            vaultSetupToken: mockVaultSetupToken,
            onApprove: mockOnApprove,
            onCancel: mockOnCancel,
            onError: mockOnError,
        });
    });

    test("should create a PayPal save payment session when the hook is called with createVaultToken callback", () => {
        const mockCreateVaultToken = jest
            .fn()
            .mockResolvedValue({ vaultSetupToken: "created-token-456" });
        const mockOnApprove = jest.fn();
        const mockOnCancel = jest.fn();
        const mockOnError = jest.fn();
        const mockStart = jest.fn();
        const mockSession: SavePaymentSession = {
            cancel: jest.fn(),
            destroy: jest.fn(),
            start: mockStart,
        };
        const mockCreatePayPalSavePaymentSession = jest
            .fn()
            .mockReturnValue(mockSession);

        (usePayPal as jest.Mock).mockReturnValue({
            sdkInstance: {
                createPayPalSavePaymentSession:
                    mockCreatePayPalSavePaymentSession,
            },
        });

        renderHook(() =>
            usePayPalSavePaymentSession({
                presentationMode: "auto",
                createVaultToken: mockCreateVaultToken,
                onApprove: mockOnApprove,
                onCancel: mockOnCancel,
                onError: mockOnError,
            }),
        );

        expect(mockCreatePayPalSavePaymentSession).toHaveBeenCalledTimes(1);
        expect(mockCreatePayPalSavePaymentSession).toHaveBeenCalledWith({
            vaultSetupToken: undefined,
            onApprove: mockOnApprove,
            onCancel: mockOnCancel,
            onError: mockOnError,
        });
    });

    test("should error if there is no sdkInstance when called and not create a session", () => {
        const mockVaultSetupToken = "vault-setup-token-123";
        const mockSession: SavePaymentSession = {
            cancel: jest.fn(),
            destroy: jest.fn(),
            start: jest.fn(),
        };
        const mockCreatePayPalSavePaymentSession = jest
            .fn()
            .mockReturnValue(mockSession);

        (usePayPal as jest.Mock).mockReturnValue({
            sdkInstance: null,
            loadingStatus: INSTANCE_LOADING_STATE.REJECTED,
        });

        const {
            result: {
                current: { error },
            },
        } = renderHook(() =>
            usePayPalSavePaymentSession({
                presentationMode: "auto",
                vaultSetupToken: mockVaultSetupToken,
                onApprove: jest.fn(),
            }),
        );

        expectCurrentErrorValue(error);

        expect(error).toEqual(new Error("no sdk instance available"));
        expect(mockCreatePayPalSavePaymentSession).not.toHaveBeenCalled();
    });

    test("should not error if there is no sdkInstance but loading is still pending", () => {
        const mockVaultSetupToken = "vault-setup-token-123";

        (usePayPal as jest.Mock).mockReturnValue({
            sdkInstance: null,
            loadingStatus: INSTANCE_LOADING_STATE.PENDING,
        });

        const {
            result: {
                current: { error },
            },
        } = renderHook(() =>
            usePayPalSavePaymentSession({
                presentationMode: "auto",
                vaultSetupToken: mockVaultSetupToken,
                onApprove: jest.fn(),
            }),
        );

        expect(error).toBeNull();
    });

    test("should clear any sdkInstance related errors if the sdkInstance becomes available", () => {
        const mockVaultSetupToken = "vault-setup-token-123";
        const mockSession: SavePaymentSession = {
            cancel: jest.fn(),
            destroy: jest.fn(),
            start: jest.fn(),
        };
        const mockCreatePayPalSavePaymentSession = jest
            .fn()
            .mockReturnValue(mockSession);

        // First render: no sdkInstance and not in PENDING state, should error
        (usePayPal as jest.Mock).mockReturnValue({
            sdkInstance: null,
            loadingStatus: INSTANCE_LOADING_STATE.REJECTED,
        });

        const { result, rerender } = renderHook(() =>
            usePayPalSavePaymentSession({
                presentationMode: "auto",
                vaultSetupToken: mockVaultSetupToken,
                onApprove: jest.fn(),
            }),
        );

        expectCurrentErrorValue(result.current.error);
        expect(result.current.error).toEqual(
            new Error("no sdk instance available"),
        );

        // Second render: sdkInstance becomes available, error should clear
        (usePayPal as jest.Mock).mockReturnValue({
            sdkInstance: {
                createPayPalSavePaymentSession:
                    mockCreatePayPalSavePaymentSession,
            },
            loadingStatus: INSTANCE_LOADING_STATE.RESOLVED,
        });

        rerender();

        expect(result.current.error).toBeNull();
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
        "should handle $description thrown by createPayPalSavePaymentSession",
        ({ thrownError }) => {
            const mockSdkInstanceWithError = {
                createPayPalSavePaymentSession: jest
                    .fn()
                    .mockImplementation(() => {
                        throw thrownError;
                    }),
            };

            (usePayPal as jest.Mock).mockReturnValue({
                sdkInstance: mockSdkInstanceWithError,
                loadingStatus: INSTANCE_LOADING_STATE.RESOLVED,
            });

            const {
                result: {
                    current: { error },
                },
            } = renderHook(() =>
                usePayPalSavePaymentSession({
                    presentationMode: "popup",
                    vaultSetupToken: "test-vault-token",
                    onApprove: jest.fn(),
                    onCancel: jest.fn(),
                    onError: jest.fn(),
                }),
            );

            expectCurrentErrorValue(error);

            expect(error?.message).toContain("Failed to create");
            expect(error?.message).toContain("session");
            expect(error?.message).toContain(
                "This may occur if the required components are not included in the SDK components array",
            );
            expect(
                (error as Error & { cause: typeof thrownError })?.cause,
            ).toBe(thrownError);
        },
    );

    test.each([
        [INSTANCE_LOADING_STATE.PENDING, true],
        [INSTANCE_LOADING_STATE.RESOLVED, false],
        [INSTANCE_LOADING_STATE.REJECTED, false],
    ])(
        "should return isPending as %s when loadingStatus is %s",
        (loadingStatus, expectedIsPending) => {
            (usePayPal as jest.Mock).mockReturnValue({
                sdkInstance: null,
                loadingStatus,
            });

            const { result } = renderHook(() =>
                usePayPalSavePaymentSession({
                    presentationMode: "popup",
                    vaultSetupToken: "test-vault-token",
                    onApprove: jest.fn(),
                }),
            );

            expect(result.current.isPending).toBe(expectedIsPending);
        },
    );

    test("should provide a click handler that calls session start with vaultSetupToken", async () => {
        const mockStart = jest.fn();
        const mockSession: SavePaymentSession = {
            cancel: jest.fn(),
            destroy: jest.fn(),
            start: mockStart,
        };
        const mockCreatePayPalSavePaymentSession = jest
            .fn()
            .mockReturnValue(mockSession);

        (usePayPal as jest.Mock).mockReturnValue({
            sdkInstance: {
                createPayPalSavePaymentSession:
                    mockCreatePayPalSavePaymentSession,
            },
        });

        const mockPresentationMode = "auto";
        const mockVaultSetupToken = "vault-setup-token-123";
        const {
            result: {
                current: { handleClick },
            },
        } = renderHook(() =>
            usePayPalSavePaymentSession({
                presentationMode: mockPresentationMode,
                vaultSetupToken: mockVaultSetupToken,
                onApprove: jest.fn(),
            }),
        );

        await act(async () => {
            handleClick();
        });

        expect(mockStart).toHaveBeenCalledTimes(1);
        expect(mockStart).toHaveBeenCalledWith({
            presentationMode: mockPresentationMode,
        });
    });

    test("should call the createVaultToken callback, if it was provided, on start inside the click handler", async () => {
        const mockStart = jest.fn();
        const mockSession: SavePaymentSession = {
            cancel: jest.fn(),
            destroy: jest.fn(),
            start: mockStart,
        };
        const mockCreatePayPalSavePaymentSession = jest
            .fn()
            .mockReturnValue(mockSession);

        (usePayPal as jest.Mock).mockReturnValue({
            sdkInstance: {
                createPayPalSavePaymentSession:
                    mockCreatePayPalSavePaymentSession,
            },
        });

        const mockPresentationMode = "auto";
        const mockVaultTokenPromise = Promise.resolve({
            vaultSetupToken: "created-token-789",
        });
        const mockCreateVaultToken = jest.fn(() => mockVaultTokenPromise);
        const mockOnApprove = jest.fn();
        const {
            result: {
                current: { handleClick },
            },
        } = renderHook(() =>
            usePayPalSavePaymentSession({
                presentationMode: mockPresentationMode,
                createVaultToken: mockCreateVaultToken,
                onApprove: mockOnApprove,
            }),
        );

        await act(async () => {
            handleClick();
        });

        expect(mockCreatePayPalSavePaymentSession).toHaveBeenCalledWith({
            onApprove: mockOnApprove,
            vaultSetupToken: undefined,
        });

        expect(mockStart).toHaveBeenCalledTimes(1);
        expect(mockStart).toHaveBeenCalledWith(
            { presentationMode: mockPresentationMode },
            mockVaultTokenPromise,
        );
    });

    test("should error if the click handler is called and there is no session", async () => {
        const mockCreatePayPalSavePaymentSession = jest
            .fn()
            .mockReturnValue(null);

        (usePayPal as jest.Mock).mockReturnValue({
            sdkInstance: {
                createPayPalSavePaymentSession:
                    mockCreatePayPalSavePaymentSession,
            },
        });

        const mockPresentationMode = "auto";
        const mockVaultTokenPromise = Promise.resolve({
            vaultSetupToken: "created-token-abc",
        });
        const mockCreateVaultToken = jest.fn(() => mockVaultTokenPromise);
        const { result } = renderHook(() =>
            usePayPalSavePaymentSession({
                presentationMode: mockPresentationMode,
                createVaultToken: mockCreateVaultToken,
                onApprove: jest.fn(),
            }),
        );

        await act(async () => {
            await result.current.handleClick();
        });

        const { error } = result.current;

        expectCurrentErrorValue(error);

        expect(error).toEqual(new Error("Save Payment session not available"));
    });

    test("should do nothing if the click handler is called after unmount", async () => {
        const mockStart = jest.fn();
        const mockSession: SavePaymentSession = {
            cancel: jest.fn(),
            destroy: jest.fn(),
            start: mockStart,
        };
        const mockCreatePayLaterOneTimePaymentSession = jest
            .fn()
            .mockReturnValue(mockSession);

        (usePayPal as jest.Mock).mockReturnValue({
            sdkInstance: {
                createPayPalSavePaymentSession:
                    mockCreatePayLaterOneTimePaymentSession,
            },
        });

        const mockPresentationMode = "auto";
        const mockVaultSetupToken = "vault-setup-token-123";
        const { result, unmount } = renderHook(() =>
            usePayPalSavePaymentSession({
                presentationMode: mockPresentationMode,
                vaultSetupToken: mockVaultSetupToken,
                onApprove: jest.fn(),
            }),
        );

        unmount();

        await act(async () => {
            await result.current.handleClick();
        });

        const { error } = result.current;

        expectCurrentErrorValue(error);

        expect(error).toBeNull();
        expect(mockStart).not.toHaveBeenCalled();
    });

    test("should provide a cancel handler that cancels the session", async () => {
        const mockCancel = jest.fn();
        const mockSession: SavePaymentSession = {
            cancel: mockCancel,
            destroy: jest.fn(),
            start: jest.fn(),
        };
        const mockCreatePayPalSavePaymentSession = jest
            .fn()
            .mockReturnValue(mockSession);

        (usePayPal as jest.Mock).mockReturnValue({
            sdkInstance: {
                createPayPalSavePaymentSession:
                    mockCreatePayPalSavePaymentSession,
            },
        });

        const mockPresentationMode = "auto";
        const mockVaultSetupToken = "vault-setup-token-123";
        const {
            result: {
                current: { handleCancel },
            },
        } = renderHook(() =>
            usePayPalSavePaymentSession({
                presentationMode: mockPresentationMode,
                vaultSetupToken: mockVaultSetupToken,
                onApprove: jest.fn(),
            }),
        );

        await act(async () => {
            handleCancel();
        });

        expect(mockCancel).toHaveBeenCalledTimes(1);
    });

    test("should provide a destroy handler that destroys the session", async () => {
        const mockDestroy = jest.fn();
        const mockSession: SavePaymentSession = {
            cancel: jest.fn(),
            destroy: mockDestroy,
            start: jest.fn(),
        };
        const mockCreatePayPalSavePaymentSession = jest
            .fn()
            .mockReturnValue(mockSession);

        (usePayPal as jest.Mock).mockReturnValue({
            sdkInstance: {
                createPayPalSavePaymentSession:
                    mockCreatePayPalSavePaymentSession,
            },
        });

        const mockPresentationMode = "auto";
        const mockVaultSetupToken = "vault-setup-token-123";
        const {
            result: {
                current: { handleDestroy },
            },
        } = renderHook(() =>
            usePayPalSavePaymentSession({
                presentationMode: mockPresentationMode,
                vaultSetupToken: mockVaultSetupToken,
                onApprove: jest.fn(),
            }),
        );

        await act(async () => {
            handleDestroy();
        });

        expect(mockDestroy).toHaveBeenCalledTimes(1);
    });

    test("should destroy session on unmount", () => {
        const mockDestroy = jest.fn();
        const mockSession: SavePaymentSession = {
            cancel: jest.fn(),
            destroy: mockDestroy,
            start: jest.fn(),
        };
        const mockCreatePayPalSavePaymentSession = jest
            .fn()
            .mockReturnValue(mockSession);

        (usePayPal as jest.Mock).mockReturnValue({
            sdkInstance: {
                createPayPalSavePaymentSession:
                    mockCreatePayPalSavePaymentSession,
            },
        });

        const mockVaultSetupToken = "vault-setup-token-123";
        const { unmount } = renderHook(() =>
            usePayPalSavePaymentSession({
                presentationMode: "auto",
                vaultSetupToken: mockVaultSetupToken,
                onApprove: jest.fn(),
            }),
        );

        unmount();

        expect(mockDestroy).toHaveBeenCalledTimes(1);
    });

    test("should not re-run if callbacks are updated", () => {
        // For this test, we want to use actual useProxyProps so the callbacks can update without triggering
        // the hook to run again and create another session.
        (useProxyProps as jest.Mock).mockImplementation(
            jest.requireActual("../utils").useProxyProps,
        );

        const mockVaultSetupToken = "vault-setup-token-123";
        const mockStart = jest.fn();
        const mockSession: SavePaymentSession = {
            cancel: jest.fn(),
            destroy: jest.fn(),
            start: mockStart,
        };
        const mockCreatePayPalSavePaymentSession = jest
            .fn()
            .mockReturnValue(mockSession);

        (usePayPal as jest.Mock).mockReturnValue({
            sdkInstance: {
                createPayPalSavePaymentSession:
                    mockCreatePayPalSavePaymentSession,
            },
        });

        const mockOnApprove = jest.fn();
        const mockOnCancel = jest.fn();
        const mockOnError = jest.fn();
        const { rerender } = renderHook(() =>
            usePayPalSavePaymentSession({
                presentationMode: "auto",
                vaultSetupToken: mockVaultSetupToken,
                onApprove: mockOnApprove,
                onCancel: mockOnCancel,
                onError: mockOnError,
            }),
        );

        expect(mockCreatePayPalSavePaymentSession).toHaveBeenCalledTimes(1);

        // Rerender with same props (callback references might change but proxy prevents re-creation)
        rerender();

        // Should not create a new session
        expect(mockCreatePayPalSavePaymentSession).toHaveBeenCalledTimes(1);
    });

    test("should recreate session when vaultSetupToken changes", () => {
        const mockDestroy = jest.fn();
        const mockSession: SavePaymentSession = {
            cancel: jest.fn(),
            destroy: mockDestroy,
            start: jest.fn(),
        };
        const mockCreatePayPalSavePaymentSession = jest
            .fn()
            .mockReturnValue(mockSession);

        (usePayPal as jest.Mock).mockReturnValue({
            sdkInstance: {
                createPayPalSavePaymentSession:
                    mockCreatePayPalSavePaymentSession,
            },
        });

        const mockOnApprove = jest.fn();
        const { rerender } = renderHook(
            ({ vaultSetupToken }) =>
                usePayPalSavePaymentSession({
                    presentationMode: "auto",
                    vaultSetupToken,
                    onApprove: mockOnApprove,
                }),
            { initialProps: { vaultSetupToken: "vault-token-1" } },
        );

        expect(mockCreatePayPalSavePaymentSession).toHaveBeenCalledTimes(1);
        expect(mockCreatePayPalSavePaymentSession).toHaveBeenCalledWith({
            vaultSetupToken: "vault-token-1",
            onApprove: mockOnApprove,
        });

        // Rerender with new vaultSetupToken
        rerender({ vaultSetupToken: "vault-token-2" });

        // Should destroy old session
        expect(mockDestroy).toHaveBeenCalledTimes(1);

        // Should create new session with new token
        expect(mockCreatePayPalSavePaymentSession).toHaveBeenCalledTimes(2);
        expect(mockCreatePayPalSavePaymentSession).toHaveBeenLastCalledWith({
            vaultSetupToken: "vault-token-2",
            onApprove: mockOnApprove,
        });
    });

    test("should recreate session when SDK instance changes", () => {
        const mockDestroy = jest.fn();
        const mockSession: SavePaymentSession = {
            cancel: jest.fn(),
            destroy: mockDestroy,
            start: jest.fn(),
        };
        const mockCreatePayPalSavePaymentSession = jest
            .fn()
            .mockReturnValue(mockSession);

        const mockSdkInstance1 = {
            createPayPalSavePaymentSession: mockCreatePayPalSavePaymentSession,
        };

        (usePayPal as jest.Mock).mockReturnValue({
            sdkInstance: mockSdkInstance1,
        });

        const mockVaultSetupToken = "vault-setup-token-123";
        const { rerender } = renderHook(() =>
            usePayPalSavePaymentSession({
                presentationMode: "auto",
                vaultSetupToken: mockVaultSetupToken,
                onApprove: jest.fn(),
            }),
        );

        expect(mockCreatePayPalSavePaymentSession).toHaveBeenCalledTimes(1);

        // Change SDK instance
        const mockSdkInstance2 = {
            createPayPalSavePaymentSession: jest
                .fn()
                .mockReturnValue(mockSession),
        };

        (usePayPal as jest.Mock).mockReturnValue({
            sdkInstance: mockSdkInstance2,
        });

        rerender();

        // Should destroy old session
        expect(mockDestroy).toHaveBeenCalledTimes(1);

        // Should create new session with new SDK instance
        expect(
            mockSdkInstance2.createPayPalSavePaymentSession,
        ).toHaveBeenCalledTimes(1);
    });

    test("should handle onApprove callback with vaultSetupToken data", async () => {
        const mockOnApprove = jest.fn();
        const mockSession: SavePaymentSession = {
            cancel: jest.fn(),
            destroy: jest.fn(),
            start: jest.fn(),
        };
        const mockCreatePayPalSavePaymentSession = jest
            .fn()
            .mockReturnValue(mockSession);

        (usePayPal as jest.Mock).mockReturnValue({
            sdkInstance: {
                createPayPalSavePaymentSession:
                    mockCreatePayPalSavePaymentSession,
            },
        });

        renderHook(() =>
            usePayPalSavePaymentSession({
                presentationMode: "auto",
                vaultSetupToken: "vault-token-123",
                onApprove: mockOnApprove,
            }),
        );

        const createSessionCall =
            mockCreatePayPalSavePaymentSession.mock.calls[0][0];

        // Simulate the approve flow
        const mockApproveData = { vaultSetupToken: "vault-token-123" };
        await act(async () => {
            createSessionCall.onApprove(mockApproveData);
        });

        expect(mockOnApprove).toHaveBeenCalledWith(mockApproveData);
    });

    test("should handle onCancel callback", async () => {
        const mockOnCancel = jest.fn();
        const mockSession: SavePaymentSession = {
            cancel: jest.fn(),
            destroy: jest.fn(),
            start: jest.fn(),
        };
        const mockCreatePayPalSavePaymentSession = jest
            .fn()
            .mockReturnValue(mockSession);

        (usePayPal as jest.Mock).mockReturnValue({
            sdkInstance: {
                createPayPalSavePaymentSession:
                    mockCreatePayPalSavePaymentSession,
            },
        });

        renderHook(() =>
            usePayPalSavePaymentSession({
                presentationMode: "auto",
                vaultSetupToken: "vault-token-123",
                onApprove: jest.fn(),
                onCancel: mockOnCancel,
            }),
        );

        const createSessionCall =
            mockCreatePayPalSavePaymentSession.mock.calls[0][0];

        // Simulate the cancel flow
        await act(async () => {
            createSessionCall.onCancel();
        });

        expect(mockOnCancel).toHaveBeenCalled();
    });

    test("should handle onError callback", async () => {
        const mockOnError = jest.fn();
        const mockSession: SavePaymentSession = {
            cancel: jest.fn(),
            destroy: jest.fn(),
            start: jest.fn(),
        };
        const mockCreatePayPalSavePaymentSession = jest
            .fn()
            .mockReturnValue(mockSession);

        (usePayPal as jest.Mock).mockReturnValue({
            sdkInstance: {
                createPayPalSavePaymentSession:
                    mockCreatePayPalSavePaymentSession,
            },
        });

        renderHook(() =>
            usePayPalSavePaymentSession({
                presentationMode: "auto",
                vaultSetupToken: "vault-token-123",
                onApprove: jest.fn(),
                onError: mockOnError,
            }),
        );

        const createSessionCall =
            mockCreatePayPalSavePaymentSession.mock.calls[0][0];

        // Simulate the error flow
        const mockError = new Error("Save payment failed");
        await act(async () => {
            createSessionCall.onError(mockError);
        });

        expect(mockOnError).toHaveBeenCalledWith(mockError);
    });

    test("should support different presentation modes", async () => {
        const mockStart = jest.fn();
        const mockSession: SavePaymentSession = {
            cancel: jest.fn(),
            destroy: jest.fn(),
            start: mockStart,
        };
        const mockCreatePayPalSavePaymentSession = jest
            .fn()
            .mockReturnValue(mockSession);

        (usePayPal as jest.Mock).mockReturnValue({
            sdkInstance: {
                createPayPalSavePaymentSession:
                    mockCreatePayPalSavePaymentSession,
            },
        });

        const {
            result: {
                current: { handleClick },
            },
        } = renderHook(() =>
            usePayPalSavePaymentSession({
                presentationMode: "popup",
                vaultSetupToken: "vault-token-123",
                onApprove: jest.fn(),
            }),
        );

        await act(async () => {
            handleClick();
        });

        expect(mockStart).toHaveBeenCalledWith({
            presentationMode: "popup",
        });
    });
});
