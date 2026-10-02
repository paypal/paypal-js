import { renderHook, act } from "@testing-library/react-hooks";

import { expectCurrentErrorValue } from "./useErrorTestUtil";
import { useVenmoSavePaymentSession } from "./useVenmoSavePaymentSession";
import {
  mockPayPalContext,
  mockPayPalRejected,
  mockPayPalPending,
} from "./usePayPalTestUtils";
import { useProxyProps } from "../utils";
import { INSTANCE_LOADING_STATE, type VenmoSavePaymentSession } from "../types";

import type { UseVenmoSavePaymentSessionProps } from "./useVenmoSavePaymentSession";

jest.mock("./usePayPal");

jest.mock("../utils", () => ({
  ...jest.requireActual("../utils"),
  useProxyProps: jest.fn(),
}));

const mockUseProxyProps = useProxyProps as jest.MockedFunction<
  typeof useProxyProps
>;

const createMockVenmoSession = (): VenmoSavePaymentSession => ({
  start: jest.fn().mockResolvedValue(undefined),
  cancel: jest.fn(),
  destroy: jest.fn(),
});

const createMockSdkInstance = (venmoSession = createMockVenmoSession()) => ({
  createVenmoSavePaymentSession: jest.fn().mockReturnValue(venmoSession),
});

describe("useVenmoSavePaymentSession", () => {
  let mockVenmoSession: VenmoSavePaymentSession;
  let mockSdkInstance: ReturnType<typeof createMockSdkInstance>;

  beforeEach(() => {
    mockUseProxyProps.mockImplementation((callbacks) => callbacks);

    mockVenmoSession = createMockVenmoSession();
    mockSdkInstance = createMockSdkInstance(mockVenmoSession);

    mockPayPalContext({ sdkInstance: mockSdkInstance });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("initialization", () => {
    test("should not create session when no SDK instance is available", () => {
      mockPayPalRejected();

      const props: UseVenmoSavePaymentSessionProps = {
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
      } = renderHook(() => useVenmoSavePaymentSession(props));

      expectCurrentErrorValue(error);

      expect(error).toEqual(new Error("no sdk instance available"));
      expect(
        mockSdkInstance.createVenmoSavePaymentSession,
      ).not.toHaveBeenCalled();
    });

    test("should not error if there is no sdkInstance but loading is still pending", () => {
      mockPayPalPending();

      const props: UseVenmoSavePaymentSessionProps = {
        presentationMode: "popup",
        vaultSetupToken: "test-vault-token",
        onApprove: jest.fn(),
      };

      const {
        result: {
          current: { error },
        },
      } = renderHook(() => useVenmoSavePaymentSession(props));

      expect(error).toBeNull();
    });

    test("should clear any sdkInstance related errors if the sdkInstance becomes available", () => {
      const mockSession = createMockVenmoSession();
      const mockSdkInstanceNew = createMockSdkInstance(mockSession);

      mockPayPalRejected();

      const props: UseVenmoSavePaymentSessionProps = {
        presentationMode: "popup",
        vaultSetupToken: "test-vault-token",
        onApprove: jest.fn(),
      };

      const { result, rerender } = renderHook(() =>
        useVenmoSavePaymentSession(props),
      );

      expectCurrentErrorValue(result.current.error);
      expect(result.current.error).toEqual(
        new Error("no sdk instance available"),
      );

      mockPayPalContext({ sdkInstance: mockSdkInstanceNew });

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
      "should handle $description thrown by createVenmoSavePaymentSession",
      ({ thrownError }) => {
        const mockSdkInstanceWithError = {
          createVenmoSavePaymentSession: jest.fn().mockImplementation(() => {
            throw thrownError;
          }),
        };

        mockPayPalContext({ sdkInstance: mockSdkInstanceWithError });

        const props: UseVenmoSavePaymentSessionProps = {
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
        } = renderHook(() => useVenmoSavePaymentSession(props));

        expectCurrentErrorValue(error);

        expect(error?.message).toContain("Failed to create");
        expect(error?.message).toContain("session");
        expect(error?.message).toContain(
          "This may occur if the required component",
        );
        expect((error as Error & { cause: typeof thrownError })?.cause).toBe(
          thrownError,
        );
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

        const props: UseVenmoSavePaymentSessionProps = {
          presentationMode: "popup",
          vaultSetupToken: "test-vault-token",
          onApprove: jest.fn(),
        };

        const { result } = renderHook(() => useVenmoSavePaymentSession(props));

        expect(result.current.isPending).toBe(expectedIsPending);
      },
    );

    test("should create Venmo save session with vaultSetupToken when provided", () => {
      const onApprove = jest.fn();
      const onCancel = jest.fn();
      const onError = jest.fn();

      const props: UseVenmoSavePaymentSessionProps = {
        presentationMode: "popup",
        vaultSetupToken: "test-vault-token",
        onApprove,
        onCancel,
        onError,
      };

      renderHook(() => useVenmoSavePaymentSession(props));

      const createSessionCall =
        mockSdkInstance.createVenmoSavePaymentSession.mock.calls[0][0];

      expect(
        mockSdkInstance.createVenmoSavePaymentSession,
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

    test("should create Venmo save session without vaultSetupToken when createVaultToken is provided", () => {
      const mockCreateVaultToken = jest
        .fn()
        .mockReturnValue(Promise.resolve({ vaultSetupToken: "created-token" }));
      const onApprove = jest.fn();

      const props: UseVenmoSavePaymentSessionProps = {
        presentationMode: "popup",
        createVaultToken: mockCreateVaultToken,
        onApprove,
      };

      renderHook(() => useVenmoSavePaymentSession(props));

      expect(
        mockSdkInstance.createVenmoSavePaymentSession,
      ).toHaveBeenCalledWith({
        vaultSetupToken: undefined,
        onApprove,
      });
    });
  });

  describe("session lifecycle", () => {
    test("should destroy session on unmount", () => {
      const props: UseVenmoSavePaymentSessionProps = {
        presentationMode: "popup",
        vaultSetupToken: "test-vault-token",
        onApprove: jest.fn(),
      };

      const { unmount } = renderHook(() => useVenmoSavePaymentSession(props));

      unmount();

      expect(mockVenmoSession.destroy).toHaveBeenCalled();
    });

    test("should recreate session when vaultSetupToken changes", () => {
      const onApprove = jest.fn();
      const { rerender } = renderHook(
        ({ vaultSetupToken }) =>
          useVenmoSavePaymentSession({
            presentationMode: "popup",
            vaultSetupToken,
            onApprove,
          }),
        { initialProps: { vaultSetupToken: "test-vault-token-1" } },
      );

      jest.clearAllMocks();

      rerender({ vaultSetupToken: "test-vault-token-2" });

      expect(mockVenmoSession.destroy).toHaveBeenCalled();
      expect(
        mockSdkInstance.createVenmoSavePaymentSession,
      ).toHaveBeenCalledWith({
        vaultSetupToken: "test-vault-token-2",
        onApprove,
      });
    });

    test("should recreate session when SDK instance changes", () => {
      const props: UseVenmoSavePaymentSessionProps = {
        presentationMode: "popup",
        vaultSetupToken: "test-vault-token",
        onApprove: jest.fn(),
      };

      const { rerender } = renderHook(() => useVenmoSavePaymentSession(props));

      jest.clearAllMocks();

      const newMockSession = createMockVenmoSession();
      const newMockSdkInstance = createMockSdkInstance(newMockSession);

      mockPayPalContext({ sdkInstance: newMockSdkInstance });

      rerender();

      expect(mockVenmoSession.destroy).toHaveBeenCalled();
      expect(
        newMockSdkInstance.createVenmoSavePaymentSession,
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
          useVenmoSavePaymentSession({
            presentationMode: "popup",
            vaultSetupToken: "test-vault-token",
            onApprove,
          }),
        { initialProps: { onApprove: initialOnApprove } },
      );

      jest.clearAllMocks();

      rerender({ onApprove: newOnApprove });

      expect(mockVenmoSession.destroy).not.toHaveBeenCalled();
      expect(
        mockSdkInstance.createVenmoSavePaymentSession,
      ).not.toHaveBeenCalled();
    });
  });

  describe("handleClick", () => {
    test("should start session with presentation mode and vaultSetupToken", async () => {
      const props: UseVenmoSavePaymentSessionProps = {
        presentationMode: "popup",
        vaultSetupToken: "test-vault-token",
        onApprove: jest.fn(),
      };

      const { result } = renderHook(() => useVenmoSavePaymentSession(props));

      await act(async () => {
        await result.current.handleClick();
      });

      expect(mockVenmoSession.start).toHaveBeenCalledWith({
        presentationMode: "popup",
      });
    });

    test("should start session with createVaultToken when provided", async () => {
      const mockCreateVaultToken = jest
        .fn()
        .mockReturnValue(Promise.resolve({ vaultSetupToken: "created-token" }));

      const props: UseVenmoSavePaymentSessionProps = {
        presentationMode: "popup",
        createVaultToken: mockCreateVaultToken,
        onApprove: jest.fn(),
      };

      const { result } = renderHook(() => useVenmoSavePaymentSession(props));

      await act(async () => {
        await result.current.handleClick();
      });

      expect(mockVenmoSession.start).toHaveBeenCalledWith(
        { presentationMode: "popup" },
        expect.any(Promise),
      );
      expect(mockCreateVaultToken).toHaveBeenCalled();
    });

    test("should do nothing if the click handler is called and the component has been unmounted", async () => {
      const props: UseVenmoSavePaymentSessionProps = {
        presentationMode: "popup",
        vaultSetupToken: "test-vault-token",
        onApprove: jest.fn(),
      };

      const { result, unmount } = renderHook(() =>
        useVenmoSavePaymentSession(props),
      );

      unmount();

      await act(async () => {
        await result.current.handleClick();
      });

      const { error } = result.current;

      expectCurrentErrorValue(error);

      expect(error).toBeNull();
      expect(mockVenmoSession.start).not.toHaveBeenCalled();
    });

    test("should default presentationMode to 'auto' when not provided", async () => {
      const props: UseVenmoSavePaymentSessionProps = {
        vaultSetupToken: "test-vault-token",
        onApprove: jest.fn(),
      };

      const { result } = renderHook(() => useVenmoSavePaymentSession(props));

      await act(async () => {
        await result.current.handleClick();
      });

      expect(mockVenmoSession.start).toHaveBeenCalledWith(
        expect.objectContaining({ presentationMode: "auto" }),
      );
    });

    test("should forward sandboxSupport to start", async () => {
      const props: UseVenmoSavePaymentSessionProps = {
        vaultSetupToken: "test-vault-token",
        onApprove: jest.fn(),
        sandboxSupport: { enabled: true },
      };

      const { result } = renderHook(() => useVenmoSavePaymentSession(props));

      await act(async () => {
        await result.current.handleClick();
      });

      expect(mockVenmoSession.start).toHaveBeenCalledWith(
        expect.objectContaining({
          presentationMode: "auto",
          sandboxSupport: { enabled: true },
        }),
      );
    });

    test("should omit sandboxSupport from start options when not provided", async () => {
      const props: UseVenmoSavePaymentSessionProps = {
        vaultSetupToken: "test-vault-token",
        onApprove: jest.fn(),
      };

      const { result } = renderHook(() => useVenmoSavePaymentSession(props));

      await act(async () => {
        await result.current.handleClick();
      });

      const startOptions = (mockVenmoSession.start as jest.Mock).mock
        .calls[0][0];
      expect(startOptions).not.toHaveProperty("sandboxSupport");
    });
  });

  describe("handleCancel", () => {
    test("should cancel session when available", () => {
      const props: UseVenmoSavePaymentSessionProps = {
        presentationMode: "popup",
        vaultSetupToken: "test-vault-token",
        onApprove: jest.fn(),
      };

      const { result } = renderHook(() => useVenmoSavePaymentSession(props));

      act(() => {
        result.current.handleCancel();
      });

      expect(mockVenmoSession.cancel).toHaveBeenCalled();
    });

    test("should not throw error when session is not available", () => {
      const props: UseVenmoSavePaymentSessionProps = {
        presentationMode: "popup",
        vaultSetupToken: "test-vault-token",
        onApprove: jest.fn(),
      };

      const { result, unmount } = renderHook(() =>
        useVenmoSavePaymentSession(props),
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
      const props: UseVenmoSavePaymentSessionProps = {
        presentationMode: "popup",
        vaultSetupToken: "test-vault-token",
        onApprove: jest.fn(),
      };

      const { result } = renderHook(() => useVenmoSavePaymentSession(props));

      act(() => {
        result.current.handleDestroy();
      });

      expect(mockVenmoSession.destroy).toHaveBeenCalled();
    });

    test("should handle manually destroyed session gracefully", async () => {
      const props: UseVenmoSavePaymentSessionProps = {
        presentationMode: "popup",
        vaultSetupToken: "test-vault-token",
        onApprove: jest.fn(),
      };

      const { result } = renderHook(() => useVenmoSavePaymentSession(props));

      act(() => {
        result.current.handleDestroy();
      });

      await act(async () => {
        await result.current.handleClick();
      });

      const { error } = result.current;

      expectCurrentErrorValue(error);

      expect(error).toEqual(new Error("Venmo session not available"));
    });
  });
});
