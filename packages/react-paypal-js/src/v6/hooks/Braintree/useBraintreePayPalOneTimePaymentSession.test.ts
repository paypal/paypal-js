import { renderHook, act } from "@testing-library/react-hooks";

import { expectCurrentErrorValue } from "../useErrorTestUtil";
import { useBraintreePayPalOneTimePaymentSession } from "./useBraintreePayPalOneTimePaymentSession";
import { useBraintreePayPal } from "./useBraintreePayPal";
import { useProxyProps } from "../../utils";
import { INSTANCE_LOADING_STATE } from "../../types/ProviderEnums";

import type { BraintreePaymentSession } from "../../types/braintree";
import type { BraintreePayPalState } from "../../context/BraintreePayPalContext";
import type { UseBraintreePayPalOneTimePaymentSessionProps } from "./useBraintreePayPalOneTimePaymentSession";

// Must declare jest.mock at top level for hoisting
jest.mock("./useBraintreePayPal");

jest.mock("../../utils", () => ({
  ...jest.requireActual("../../utils"),
  useProxyProps: jest.fn(),
}));

const mockUseBraintreePayPal = useBraintreePayPal as jest.MockedFunction<
  typeof useBraintreePayPal
>;

const mockUseProxyProps = useProxyProps as jest.MockedFunction<
  typeof useProxyProps
>;

const createMockSession = (): BraintreePaymentSession => ({
  start: jest.fn(),
});

const createMockCheckoutInstance = (session = createMockSession()) => ({
  createOneTimePaymentSession: jest.fn().mockReturnValue(session),
});

const defaultBraintreeState: BraintreePayPalState = {
  braintreePayPalCheckoutInstance: null,
  loadingStatus: INSTANCE_LOADING_STATE.RESOLVED,
  error: null,
  isHydrated: true,
};

function mockBraintreeContext(
  overrides: Partial<
    Omit<BraintreePayPalState, "braintreePayPalCheckoutInstance"> & {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      braintreePayPalCheckoutInstance?: any;
    }
  > = {},
): void {
  mockUseBraintreePayPal.mockReturnValue({
    ...defaultBraintreeState,
    ...overrides,
  } as BraintreePayPalState);
}

function mockBraintreePending(): void {
  mockBraintreeContext({
    loadingStatus: INSTANCE_LOADING_STATE.PENDING,
  });
}

function mockBraintreeRejected(): void {
  mockBraintreeContext({
    loadingStatus: INSTANCE_LOADING_STATE.REJECTED,
  });
}

describe("useBraintreePayPalOneTimePaymentSession", () => {
  let mockSession: BraintreePaymentSession;
  let mockCheckoutInstance: ReturnType<typeof createMockCheckoutInstance>;

  const defaultProps: UseBraintreePayPalOneTimePaymentSessionProps = {
    amount: "10.00",
    currency: "USD",
    onApprove: jest.fn(),
  };

  beforeEach(() => {
    mockUseProxyProps.mockImplementation((callbacks) => callbacks);

    mockSession = createMockSession();
    mockCheckoutInstance = createMockCheckoutInstance(mockSession);

    mockBraintreeContext({
      braintreePayPalCheckoutInstance: mockCheckoutInstance,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("initialization", () => {
    test("should not create session when no checkout instance is available", () => {
      mockBraintreeRejected();

      const {
        result: {
          current: { error },
        },
      } = renderHook(() =>
        useBraintreePayPalOneTimePaymentSession(defaultProps),
      );

      expectCurrentErrorValue(error);

      expect(error).toEqual(
        new Error("Braintree checkout instance not available"),
      );
      expect(
        mockCheckoutInstance.createOneTimePaymentSession,
      ).not.toHaveBeenCalled();
    });

    test.each([
      {
        description: "Error object",
        thrownError: new Error("Braintree initialization failed"),
      },
      {
        description: "non-Error string",
        thrownError: "String error message",
      },
    ])(
      "should handle $description thrown by createOneTimePaymentSession",
      ({ thrownError }) => {
        const mockCheckoutInstanceWithError = {
          createOneTimePaymentSession: jest.fn().mockImplementation(() => {
            throw thrownError;
          }),
        };

        mockBraintreeContext({
          braintreePayPalCheckoutInstance: mockCheckoutInstanceWithError,
        });

        const {
          result: {
            current: { error },
          },
        } = renderHook(() =>
          useBraintreePayPalOneTimePaymentSession(defaultProps),
        );

        expectCurrentErrorValue(error);

        expect(error?.message).toContain(
          "Failed to create Braintree payment session",
        );
        expect(error?.message).toContain(
          "BraintreePayPalProvider is properly initialized",
        );
        expect((error as Error & { cause: typeof thrownError })?.cause).toBe(
          thrownError,
        );
      },
    );

    test("should not error if there is no checkout instance but loading is still pending", () => {
      mockBraintreePending();

      const {
        result: {
          current: { error },
        },
      } = renderHook(() =>
        useBraintreePayPalOneTimePaymentSession(defaultProps),
      );

      expect(error).toBeNull();
    });

    test("should clear errors when checkout instance becomes available", () => {
      // First render: no instance, REJECTED state
      mockBraintreeRejected();

      const { result, rerender } = renderHook(() =>
        useBraintreePayPalOneTimePaymentSession(defaultProps),
      );

      expectCurrentErrorValue(result.current.error);
      expect(result.current.error).toEqual(
        new Error("Braintree checkout instance not available"),
      );

      // Second render: instance becomes available
      const newMockSession = createMockSession();
      const newMockCheckoutInstance =
        createMockCheckoutInstance(newMockSession);

      mockBraintreeContext({
        braintreePayPalCheckoutInstance: newMockCheckoutInstance,
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
        mockBraintreeContext({ loadingStatus });

        const { result } = renderHook(() =>
          useBraintreePayPalOneTimePaymentSession(defaultProps),
        );

        expect(result.current.isPending).toBe(expectedIsPending);
      },
    );

    test("should create a session with the correct options", () => {
      const onApprove = jest.fn();
      const onCancel = jest.fn();
      const onError = jest.fn();
      const onShippingAddressChange = jest.fn();
      const onShippingOptionsChange = jest.fn();

      const props: UseBraintreePayPalOneTimePaymentSessionProps = {
        amount: "25.00",
        currency: "EUR",
        intent: "authorize",
        commit: false,
        offerCredit: true,
        userAuthenticationEmail: "test@example.com",
        displayName: "Test Store",
        presentationMode: "popup",
        onApprove,
        onCancel,
        onError,
        onShippingAddressChange,
        onShippingOptionsChange,
      };

      renderHook(() => useBraintreePayPalOneTimePaymentSession(props));

      expect(
        mockCheckoutInstance.createOneTimePaymentSession,
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          amount: "25.00",
          currency: "EUR",
          intent: "authorize",
          commit: false,
          offerCredit: true,
          userAuthenticationEmail: "test@example.com",
          displayName: "Test Store",
          presentationMode: "popup",
          onApprove,
          onCancel,
          onError,
          onShippingAddressChange,
          onShippingOptionsChange,
        }),
      );
    });

    test("should forward callback invocations to the consumer", () => {
      const onApprove = jest.fn();
      const onCancel = jest.fn();
      const onError = jest.fn();

      const props: UseBraintreePayPalOneTimePaymentSessionProps = {
        amount: "10.00",
        currency: "USD",
        onApprove,
        onCancel,
        onError,
      };

      renderHook(() => useBraintreePayPalOneTimePaymentSession(props));

      const createSessionCall =
        mockCheckoutInstance.createOneTimePaymentSession.mock.calls[0][0];

      const mockApprovalData = {
        payerId: "PAYER123",
        orderId: "ORDER456",
      };
      createSessionCall.onApprove(mockApprovalData);
      createSessionCall.onCancel();
      createSessionCall.onError(new Error("test error"));

      expect(onApprove).toHaveBeenCalledWith(mockApprovalData);
      expect(onCancel).toHaveBeenCalled();
      expect(onError).toHaveBeenCalledWith(new Error("test error"));
    });
  });

  describe("session lifecycle", () => {
    test("should nullify session on unmount", () => {
      const { result, unmount } = renderHook(() =>
        useBraintreePayPalOneTimePaymentSession(defaultProps),
      );

      unmount();

      // After unmount, handleClick should not call start
      act(() => {
        result.current.handleClick();
      });

      expect(mockSession.start).not.toHaveBeenCalled();
    });

    test("should recreate session when data options change", () => {
      const onApprove = jest.fn();

      const { rerender } = renderHook(
        ({ amount }) =>
          useBraintreePayPalOneTimePaymentSession({
            amount,
            currency: "USD",
            onApprove,
          }),
        { initialProps: { amount: "10.00" } },
      );

      expect(
        mockCheckoutInstance.createOneTimePaymentSession,
      ).toHaveBeenCalledTimes(1);

      jest.clearAllMocks();

      rerender({ amount: "20.00" });

      expect(
        mockCheckoutInstance.createOneTimePaymentSession,
      ).toHaveBeenCalledTimes(1);
      expect(
        mockCheckoutInstance.createOneTimePaymentSession,
      ).toHaveBeenCalledWith(expect.objectContaining({ amount: "20.00" }));
    });

    test("should recreate session when checkout instance changes", () => {
      const { rerender } = renderHook(() =>
        useBraintreePayPalOneTimePaymentSession(defaultProps),
      );

      jest.clearAllMocks();

      const newMockSession = createMockSession();
      const newMockCheckoutInstance =
        createMockCheckoutInstance(newMockSession);

      mockBraintreeContext({
        braintreePayPalCheckoutInstance: newMockCheckoutInstance,
      });

      rerender();

      expect(
        newMockCheckoutInstance.createOneTimePaymentSession,
      ).toHaveBeenCalled();
    });

    test("should not recreate session when only callbacks change", () => {
      mockUseProxyProps.mockImplementation(
        jest.requireActual("../../utils").useProxyProps,
      );

      const initialOnApprove = jest.fn();
      const newOnApprove = jest.fn();

      const { rerender } = renderHook(
        ({ onApprove }) =>
          useBraintreePayPalOneTimePaymentSession({
            amount: "10.00",
            currency: "USD",
            onApprove,
          }),
        { initialProps: { onApprove: initialOnApprove } },
      );

      jest.clearAllMocks();

      rerender({ onApprove: newOnApprove });

      expect(
        mockCheckoutInstance.createOneTimePaymentSession,
      ).not.toHaveBeenCalled();
    });

    test("should not recreate session when inline object options have the same values", () => {
      mockUseProxyProps.mockImplementation(
        jest.requireActual("../../utils").useProxyProps,
      );

      const { rerender } = renderHook(
        ({ lineItems }) =>
          useBraintreePayPalOneTimePaymentSession({
            amount: "10.00",
            currency: "USD",
            onApprove: jest.fn(),
            lineItems,
          }),
        {
          initialProps: {
            lineItems: [
              {
                quantity: "1",
                unitAmount: "10.00",
                name: "Item",
                kind: "debit" as const,
              },
            ],
          },
        },
      );

      jest.clearAllMocks();

      // Pass a new array reference with the same values
      rerender({
        lineItems: [
          {
            quantity: "1",
            unitAmount: "10.00",
            name: "Item",
            kind: "debit" as const,
          },
        ],
      });

      expect(
        mockCheckoutInstance.createOneTimePaymentSession,
      ).not.toHaveBeenCalled();
    });

    test("should not retry session creation on a failed checkout instance", () => {
      const mockCheckoutInstanceWithError = {
        createOneTimePaymentSession: jest.fn().mockImplementation(() => {
          throw new Error("init failure");
        }),
      };

      mockBraintreeContext({
        braintreePayPalCheckoutInstance: mockCheckoutInstanceWithError,
      });

      const { rerender } = renderHook(() =>
        useBraintreePayPalOneTimePaymentSession(defaultProps),
      );

      expect(
        mockCheckoutInstanceWithError.createOneTimePaymentSession,
      ).toHaveBeenCalledTimes(1);

      jest.clearAllMocks();

      // Rerender with same failed instance — should not retry
      rerender();

      expect(
        mockCheckoutInstanceWithError.createOneTimePaymentSession,
      ).not.toHaveBeenCalled();
    });

    test("should retry session creation when a new checkout instance replaces a failed one", () => {
      mockUseProxyProps.mockImplementation(
        jest.requireActual("../../utils").useProxyProps,
      );

      const mockCheckoutInstanceWithError = {
        createOneTimePaymentSession: jest.fn().mockImplementation(() => {
          throw new Error("init failure");
        }),
      };

      mockBraintreeContext({
        braintreePayPalCheckoutInstance: mockCheckoutInstanceWithError,
      });

      const { rerender } = renderHook(() =>
        useBraintreePayPalOneTimePaymentSession(defaultProps),
      );

      expect(
        mockCheckoutInstanceWithError.createOneTimePaymentSession,
      ).toHaveBeenCalledTimes(1);

      // Replace with a working instance
      const newMockSession = createMockSession();
      const newMockCheckoutInstance =
        createMockCheckoutInstance(newMockSession);

      mockBraintreeContext({
        braintreePayPalCheckoutInstance: newMockCheckoutInstance,
      });

      rerender();

      expect(
        newMockCheckoutInstance.createOneTimePaymentSession,
      ).toHaveBeenCalledTimes(1);
    });
  });

  describe("handleClick", () => {
    test("should call session.start() when session is available", () => {
      const { result } = renderHook(() =>
        useBraintreePayPalOneTimePaymentSession(defaultProps),
      );

      act(() => {
        result.current.handleClick();
      });

      expect(mockSession.start).toHaveBeenCalled();
    });

    test("should set error when session is not available", () => {
      mockBraintreeRejected();

      const { result } = renderHook(() =>
        useBraintreePayPalOneTimePaymentSession(defaultProps),
      );

      act(() => {
        result.current.handleClick();
      });

      const { error } = result.current;

      expectCurrentErrorValue(error);

      expect(error).toEqual(
        new Error("Braintree payment session not available"),
      );
    });

    test("should not call start after component is unmounted", () => {
      const { result, unmount } = renderHook(() =>
        useBraintreePayPalOneTimePaymentSession(defaultProps),
      );

      unmount();

      act(() => {
        result.current.handleClick();
      });

      expect(mockSession.start).not.toHaveBeenCalled();
    });
  });
});
