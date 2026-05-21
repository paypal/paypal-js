import { renderHook, act } from "@testing-library/react-hooks";

import { useLPMOneTimePaymentSession } from "./useLPMOneTimePaymentSession";
import { useProxyProps } from "../utils";
import { INSTANCE_LOADING_STATE } from "../types/ProviderEnums";
import {
  mockPayPalContext,
  mockPayPalRejected,
} from "./usePayPalTestUtils";

import type { LPMOneTimePaymentSession } from "../types";

jest.mock("./usePayPal");
jest.mock("../utils", () => ({
  ...jest.requireActual("../utils"),
  useProxyProps: jest.fn(),
}));

const mockUseProxyProps = useProxyProps as jest.MockedFunction<
  typeof useProxyProps
>;

const createMockLPMSession = (): LPMOneTimePaymentSession => ({
  start: jest.fn().mockResolvedValue(undefined),
  cancel: jest.fn(),
  destroy: jest.fn(),
  createPaymentFields: jest.fn().mockReturnValue(document.createElement("div")),
  validate: jest.fn().mockResolvedValue(true),
});

const createMockSdkInstance = (
  sessionMethod: string,
  session = createMockLPMSession(),
) => ({
  [sessionMethod]: jest.fn().mockReturnValue(session),
});

describe("useLPMOneTimePaymentSession", () => {
  const onApprove = jest.fn().mockResolvedValue(undefined);
  const onCancel = jest.fn();
  const onError = jest.fn();
  let mockSession: LPMOneTimePaymentSession;
  let mockSdkInstance: Record<string, jest.Mock>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockSession = createMockLPMSession();
    mockSdkInstance = createMockSdkInstance(
      "createIdealOneTimePaymentSession",
      mockSession,
    );
    mockUseProxyProps.mockImplementation((props) => props);
    mockPayPalContext({ sdkInstance: mockSdkInstance });
  });

  describe("works with multiple LPMs", () => {
    test.each([
      {
        lpm: "ideal" as const,
        sessionMethod: "createIdealOneTimePaymentSession",
        buttonDisplay: "iDEAL",
      },
      {
        lpm: "bancontact" as const,
        sessionMethod: "createBancontactOneTimePaymentSession",
        buttonDisplay: "Bancontact",
      },
      {
        lpm: "eps" as const,
        sessionMethod: "createEpsOneTimePaymentSession",
        buttonDisplay: "EPS",
      },
    ])(
      "should create session using $sessionMethod for $lpm",
      ({ lpm, sessionMethod }) => {
        const session = createMockLPMSession();
        const sdk = createMockSdkInstance(sessionMethod, session);
        mockPayPalContext({ sdkInstance: sdk });

        renderHook(() =>
          useLPMOneTimePaymentSession({
            lpm,
            presentationMode: "popup",
            orderId: "test-order-id",
            onApprove,
            onCancel,
            onError,
          }),
        );

        expect(sdk[sessionMethod]).toHaveBeenCalledWith(
          expect.objectContaining({ orderId: "test-order-id" }),
        );
      },
    );
  });

  describe("initialization", () => {
    test("should create session when SDK instance is available", () => {
      renderHook(() =>
        useLPMOneTimePaymentSession({
          lpm: "ideal",
          presentationMode: "popup",
          orderId: "test-order-id",
          onApprove,
          onCancel,
          onError,
        }),
      );

      expect(
        mockSdkInstance.createIdealOneTimePaymentSession,
      ).toHaveBeenCalledWith(
        expect.objectContaining({ orderId: "test-order-id" }),
      );
    });

    test("should not create session when no SDK instance is available", () => {
      mockPayPalRejected();

      const { result } = renderHook(() =>
        useLPMOneTimePaymentSession({
          lpm: "ideal",
          presentationMode: "popup",
          orderId: "test-order-id",
          onApprove,
        }),
      );

      expect(result.current.error).toEqual(
        new Error("no sdk instance available"),
      );
      expect(
        mockSdkInstance.createIdealOneTimePaymentSession,
      ).not.toHaveBeenCalled();
    });

    test("should set error when session method is not found on SDK instance", () => {
      mockPayPalContext({ sdkInstance: {} });

      const { result } = renderHook(() =>
        useLPMOneTimePaymentSession({
          lpm: "ideal",
          presentationMode: "popup",
          orderId: "test-order-id",
          onApprove,
        }),
      );

      expect(result.current.error?.message).toContain(
        'Session method "createIdealOneTimePaymentSession" not found',
      );
      expect(result.current.error?.message).toContain("ideal-payments");
    });

    test.each([
      [INSTANCE_LOADING_STATE.PENDING, true],
      [INSTANCE_LOADING_STATE.RESOLVED, false],
      [INSTANCE_LOADING_STATE.REJECTED, false],
    ])(
      "should return isPending as %s when loadingStatus is %s",
      (loadingStatus, expectedIsPending) => {
        mockPayPalContext({
          loadingStatus,
          sdkInstance: expectedIsPending ? null : mockSdkInstance,
        });

        const { result } = renderHook(() =>
          useLPMOneTimePaymentSession({
            lpm: "ideal",
            presentationMode: "popup",
            orderId: "test-order-id",
            onApprove,
          }),
        );

        expect(result.current.isPending).toBe(expectedIsPending);
      },
    );

    test.each([
      {
        description: "Error object",
        thrownError: new Error("SDK create session error"),
      },
      {
        description: "non-Error string",
        thrownError: "String error message",
      },
    ])(
      "should handle $description thrown by session creation",
      ({ thrownError }) => {
        const failingSdk = {
          createIdealOneTimePaymentSession: jest
            .fn()
            .mockImplementation(() => {
              throw thrownError;
            }),
        };
        mockPayPalContext({ sdkInstance: failingSdk });

        const { result } = renderHook(() =>
          useLPMOneTimePaymentSession({
            lpm: "ideal",
            presentationMode: "popup",
            orderId: "test-order-id",
            onApprove,
          }),
        );

        expect(result.current.error?.message).toContain(
          "Failed to create payment session",
        );
        expect(
          (result.current.error as Error & { cause: typeof thrownError })
            ?.cause,
        ).toBe(thrownError);
      },
    );
  });

  describe("session lifecycle", () => {
    test("should destroy session on unmount", () => {
      const { unmount } = renderHook(() =>
        useLPMOneTimePaymentSession({
          lpm: "ideal",
          presentationMode: "popup",
          orderId: "test-order-id",
          onApprove,
        }),
      );

      unmount();
      expect(mockSession.destroy).toHaveBeenCalled();
    });

    test("should recreate session when orderId changes", () => {
      const { rerender } = renderHook(
        ({ orderId }) =>
          useLPMOneTimePaymentSession({
            lpm: "ideal",
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

      expect(mockSession.destroy).toHaveBeenCalled();
      expect(
        mockSdkInstance.createIdealOneTimePaymentSession,
      ).toHaveBeenCalledWith(
        expect.objectContaining({ orderId: "test-order-id-2" }),
      );
    });

    test("should NOT recreate session when only callbacks change", () => {
      mockUseProxyProps.mockImplementation(
        jest.requireActual("../utils").useProxyProps,
      );
      const initialOnApprove = jest.fn().mockResolvedValue(undefined);

      const { rerender } = renderHook(
        ({ onApprove: onApproveProp }) =>
          useLPMOneTimePaymentSession({
            lpm: "ideal",
            presentationMode: "popup",
            orderId: "test-order-id",
            onApprove: onApproveProp,
          }),
        { initialProps: { onApprove: initialOnApprove } },
      );

      jest.clearAllMocks();
      rerender({ onApprove: jest.fn().mockResolvedValue(undefined) });

      expect(mockSession.destroy).not.toHaveBeenCalled();
      expect(
        mockSdkInstance.createIdealOneTimePaymentSession,
      ).not.toHaveBeenCalled();
    });
  });

  describe("handleClick", () => {
    test("should start session with presentation mode and orderId", async () => {
      const { result } = renderHook(() =>
        useLPMOneTimePaymentSession({
          lpm: "ideal",
          presentationMode: "popup",
          orderId: "test-order-id",
          onApprove,
        }),
      );

      await act(async () => {
        await result.current.handleClick();
      });

      expect(mockSession.start).toHaveBeenCalledWith(
        { presentationMode: "popup" },
        undefined,
      );
    });

    test("should start session with createOrder when provided", async () => {
      const mockCreateOrder = jest
        .fn()
        .mockReturnValue(Promise.resolve({ orderId: "created-order-id" }));

      const { result } = renderHook(() =>
        useLPMOneTimePaymentSession({
          lpm: "ideal",
          presentationMode: "popup",
          createOrder: mockCreateOrder,
          onApprove,
        }),
      );

      await act(async () => {
        await result.current.handleClick();
      });

      expect(mockSession.start).toHaveBeenCalledWith(
        { presentationMode: "popup" },
        expect.any(Promise),
      );
      expect(mockCreateOrder).toHaveBeenCalled();
    });

    test("should do nothing if component is unmounted", async () => {
      const { result, unmount } = renderHook(() =>
        useLPMOneTimePaymentSession({
          lpm: "ideal",
          presentationMode: "popup",
          orderId: "test-order-id",
          onApprove,
        }),
      );

      unmount();

      await act(async () => {
        await result.current.handleClick();
      });

      expect(mockSession.start).not.toHaveBeenCalled();
    });

    test("should set error when session is not available", async () => {
      mockPayPalContext({ sdkInstance: {} });

      const { result } = renderHook(() =>
        useLPMOneTimePaymentSession({
          lpm: "ideal",
          presentationMode: "popup",
          orderId: "test-order-id",
          onApprove,
        }),
      );

      await act(async () => {
        await result.current.handleClick();
      });

      expect(result.current.error).toBeTruthy();
    });
  });

  describe("handleCancel", () => {
    test("should call cancel on the session", () => {
      const { result } = renderHook(() =>
        useLPMOneTimePaymentSession({
          lpm: "ideal",
          presentationMode: "popup",
          orderId: "test-order-id",
          onApprove,
        }),
      );

      act(() => {
        result.current.handleCancel();
      });

      expect(mockSession.cancel).toHaveBeenCalled();
    });
  });

  describe("handleDestroy", () => {
    test("should destroy session and set error on subsequent click", async () => {
      const { result } = renderHook(() =>
        useLPMOneTimePaymentSession({
          lpm: "ideal",
          presentationMode: "popup",
          orderId: "test-order-id",
          onApprove,
        }),
      );

      act(() => {
        result.current.handleDestroy();
      });

      await act(async () => {
        await result.current.handleClick();
      });

      expect(result.current.error).toEqual(
        new Error("iDEAL session not available"),
      );
    });
  });

  describe("return value stability", () => {
    test("should return stable function references across renders", () => {
      const { result, rerender } = renderHook(() =>
        useLPMOneTimePaymentSession({
          lpm: "ideal",
          presentationMode: "popup",
          orderId: "test-order-id",
          onApprove,
        }),
      );

      const firstRender = { ...result.current };
      rerender();

      expect(result.current.handleDestroy).toBe(firstRender.handleDestroy);
      expect(result.current.handleCancel).toBe(firstRender.handleCancel);
    });
  });
});
