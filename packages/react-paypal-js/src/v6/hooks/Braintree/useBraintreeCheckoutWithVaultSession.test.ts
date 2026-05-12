import { renderHook, act } from "@testing-library/react-hooks";

import { expectCurrentErrorValue } from "../useErrorTestUtil";
import { useBraintreeCheckoutWithVaultSession } from "./useBraintreeCheckoutWithVaultSession";
import { useBraintreePayPal } from "./useBraintreePayPal";
import { useProxyProps } from "../../utils";
import { INSTANCE_LOADING_STATE } from "../../types/ProviderEnums";

import type { BraintreePaymentSession } from "../../types/braintree";
import type { BraintreePayPalState } from "../../context/BraintreePayPalContext";
import type { UseBraintreeCheckoutWithVaultSessionProps } from "./useBraintreeCheckoutWithVaultSession";

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
  createCheckoutWithVaultSession: jest.fn().mockReturnValue(session),
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

describe("useBraintreeCheckoutWithVaultSession", () => {
  let mockSession: BraintreePaymentSession;
  let mockCheckoutInstance: ReturnType<typeof createMockCheckoutInstance>;

  const defaultProps: UseBraintreeCheckoutWithVaultSessionProps = {
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
      } = renderHook(() => useBraintreeCheckoutWithVaultSession(defaultProps));

      expectCurrentErrorValue(error);

      expect(error).toEqual(
        new Error("Braintree checkout instance not available"),
      );
      expect(
        mockCheckoutInstance.createCheckoutWithVaultSession,
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
      "should handle $description thrown by createCheckoutWithVaultSession",
      ({ thrownError }) => {
        const mockCheckoutInstanceWithError = {
          createCheckoutWithVaultSession: jest.fn().mockImplementation(() => {
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
          useBraintreeCheckoutWithVaultSession(defaultProps),
        );

        expectCurrentErrorValue(error);

        expect(error?.message).toContain(
          "Failed to create Braintree checkout with vault session",
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
      } = renderHook(() => useBraintreeCheckoutWithVaultSession(defaultProps));

      expect(error).toBeNull();
    });

    test("should clear errors when checkout instance becomes available", () => {
      mockBraintreeRejected();

      const { result, rerender } = renderHook(() =>
        useBraintreeCheckoutWithVaultSession(defaultProps),
      );

      expectCurrentErrorValue(result.current.error);
      expect(result.current.error).toEqual(
        new Error("Braintree checkout instance not available"),
      );

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
          useBraintreeCheckoutWithVaultSession(defaultProps),
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

      const props: UseBraintreeCheckoutWithVaultSessionProps = {
        amount: "25.00",
        currency: "USD",
        intent: "capture",
        commit: true,
        displayName: "Test Store",
        presentationMode: "popup",
        billingAgreementDetails: { description: "Save for future purchases" },
        onApprove,
        onCancel,
        onError,
        onShippingAddressChange,
        onShippingOptionsChange,
      };

      renderHook(() => useBraintreeCheckoutWithVaultSession(props));

      expect(
        mockCheckoutInstance.createCheckoutWithVaultSession,
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          amount: "25.00",
          currency: "USD",
          intent: "capture",
          commit: true,
          displayName: "Test Store",
          presentationMode: "popup",
          billingAgreementDetails: { description: "Save for future purchases" },
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
      const onShippingAddressChange = jest.fn();
      const onShippingOptionsChange = jest.fn();

      const props: UseBraintreeCheckoutWithVaultSessionProps = {
        amount: "10.00",
        currency: "USD",
        onApprove,
        onCancel,
        onError,
        onShippingAddressChange,
        onShippingOptionsChange,
      };

      renderHook(() => useBraintreeCheckoutWithVaultSession(props));

      const createSessionCall =
        mockCheckoutInstance.createCheckoutWithVaultSession.mock.calls[0][0];

      const mockApprovalData = { payerId: "PAYER123", orderId: "ORDER456" };
      createSessionCall.onApprove(mockApprovalData);
      createSessionCall.onCancel();
      createSessionCall.onError(new Error("test error"));
      createSessionCall.onShippingAddressChange({ shippingAddress: {} });
      createSessionCall.onShippingOptionsChange({ selectedShippingOption: {} });

      expect(onApprove).toHaveBeenCalledWith(mockApprovalData);
      expect(onCancel).toHaveBeenCalled();
      expect(onError).toHaveBeenCalledWith(new Error("test error"));
      expect(onShippingAddressChange).toHaveBeenCalledWith({
        shippingAddress: {},
      });
      expect(onShippingOptionsChange).toHaveBeenCalledWith({
        selectedShippingOption: {},
      });
    });
  });

  describe("session lifecycle", () => {
    test("should nullify session on unmount", () => {
      const { result, unmount } = renderHook(() =>
        useBraintreeCheckoutWithVaultSession(defaultProps),
      );

      unmount();

      act(() => {
        result.current.handleClick();
      });

      expect(mockSession.start).not.toHaveBeenCalled();
    });

    test("should recreate session when data options change", () => {
      const onApprove = jest.fn();

      const { rerender } = renderHook(
        ({ amount }) =>
          useBraintreeCheckoutWithVaultSession({
            amount,
            currency: "USD",
            onApprove,
          }),
        { initialProps: { amount: "10.00" } },
      );

      expect(
        mockCheckoutInstance.createCheckoutWithVaultSession,
      ).toHaveBeenCalledTimes(1);

      jest.clearAllMocks();

      rerender({ amount: "20.00" });

      expect(
        mockCheckoutInstance.createCheckoutWithVaultSession,
      ).toHaveBeenCalledTimes(1);
      expect(
        mockCheckoutInstance.createCheckoutWithVaultSession,
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          amount: "20.00",
        }),
      );
    });

    test("should recreate session when checkout instance changes", () => {
      const { rerender } = renderHook(() =>
        useBraintreeCheckoutWithVaultSession(defaultProps),
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
        newMockCheckoutInstance.createCheckoutWithVaultSession,
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
          useBraintreeCheckoutWithVaultSession({
            amount: "10.00",
            currency: "USD",
            onApprove,
          }),
        { initialProps: { onApprove: initialOnApprove } },
      );

      jest.clearAllMocks();

      rerender({ onApprove: newOnApprove });

      expect(
        mockCheckoutInstance.createCheckoutWithVaultSession,
      ).not.toHaveBeenCalled();
    });

    test("should not recreate session when inline billingAgreementDetails has the same values", () => {
      mockUseProxyProps.mockImplementation(
        jest.requireActual("../../utils").useProxyProps,
      );

      const billingAgreementDetails = {
        description: "Save for future purchases",
      };

      const { rerender } = renderHook(
        ({ billingAgreementDetails }) =>
          useBraintreeCheckoutWithVaultSession({
            amount: "10.00",
            currency: "USD",
            onApprove: jest.fn(),
            billingAgreementDetails,
          }),
        { initialProps: { billingAgreementDetails } },
      );

      jest.clearAllMocks();

      rerender({
        billingAgreementDetails: { description: "Save for future purchases" },
      });

      expect(
        mockCheckoutInstance.createCheckoutWithVaultSession,
      ).not.toHaveBeenCalled();
    });

    test("should not recreate session when inline lineItems have the same values", () => {
      mockUseProxyProps.mockImplementation(
        jest.requireActual("../../utils").useProxyProps,
      );

      const lineItems = [
        {
          name: "Item 1",
          kind: "debit" as const,
          quantity: "1",
          unitAmount: "10.00",
          unitTaxAmount: "0.00",
          totalAmount: "10.00",
          url: "https://example.com",
          imageUrl: "https://example.com/image.png",
        },
      ];

      const { rerender } = renderHook(
        ({ lineItems }) =>
          useBraintreeCheckoutWithVaultSession({
            amount: "10.00",
            currency: "USD",
            onApprove: jest.fn(),
            lineItems,
          }),
        { initialProps: { lineItems } },
      );

      jest.clearAllMocks();

      rerender({
        lineItems: [
          {
            name: "Item 1",
            kind: "debit" as const,
            quantity: "1",
            unitAmount: "10.00",
            unitTaxAmount: "0.00",
            totalAmount: "10.00",
            url: "https://example.com",
            imageUrl: "https://example.com/image.png",
          },
        ],
      });

      expect(
        mockCheckoutInstance.createCheckoutWithVaultSession,
      ).not.toHaveBeenCalled();
    });

    test("should not retry session creation on a failed checkout instance", () => {
      const mockCheckoutInstanceWithError = {
        createCheckoutWithVaultSession: jest.fn().mockImplementation(() => {
          throw new Error("init failure");
        }),
      };

      mockBraintreeContext({
        braintreePayPalCheckoutInstance: mockCheckoutInstanceWithError,
      });

      const { rerender } = renderHook(() =>
        useBraintreeCheckoutWithVaultSession(defaultProps),
      );

      expect(
        mockCheckoutInstanceWithError.createCheckoutWithVaultSession,
      ).toHaveBeenCalledTimes(1);

      jest.clearAllMocks();

      rerender();

      expect(
        mockCheckoutInstanceWithError.createCheckoutWithVaultSession,
      ).not.toHaveBeenCalled();
    });

    test("should retry session creation when a new checkout instance replaces a failed one", () => {
      mockUseProxyProps.mockImplementation(
        jest.requireActual("../../utils").useProxyProps,
      );

      const mockCheckoutInstanceWithError = {
        createCheckoutWithVaultSession: jest.fn().mockImplementation(() => {
          throw new Error("init failure");
        }),
      };

      mockBraintreeContext({
        braintreePayPalCheckoutInstance: mockCheckoutInstanceWithError,
      });

      const { rerender } = renderHook(() =>
        useBraintreeCheckoutWithVaultSession(defaultProps),
      );

      expect(
        mockCheckoutInstanceWithError.createCheckoutWithVaultSession,
      ).toHaveBeenCalledTimes(1);

      const newMockSession = createMockSession();
      const newMockCheckoutInstance =
        createMockCheckoutInstance(newMockSession);

      mockBraintreeContext({
        braintreePayPalCheckoutInstance: newMockCheckoutInstance,
      });

      rerender();

      expect(
        newMockCheckoutInstance.createCheckoutWithVaultSession,
      ).toHaveBeenCalledTimes(1);
    });
  });

  describe("handleClick", () => {
    test("should call session.start() when session is available", () => {
      const { result } = renderHook(() =>
        useBraintreeCheckoutWithVaultSession(defaultProps),
      );

      act(() => {
        result.current.handleClick();
      });

      expect(mockSession.start).toHaveBeenCalled();
    });

    test("should set error when session is not available", () => {
      mockBraintreeRejected();

      const { result } = renderHook(() =>
        useBraintreeCheckoutWithVaultSession(defaultProps),
      );

      act(() => {
        result.current.handleClick();
      });

      const { error } = result.current;

      expectCurrentErrorValue(error);

      expect(error).toEqual(
        new Error("Braintree checkout with vault session not available"),
      );
    });

    test("should not call start after component is unmounted", () => {
      const { result, unmount } = renderHook(() =>
        useBraintreeCheckoutWithVaultSession(defaultProps),
      );

      unmount();

      act(() => {
        result.current.handleClick();
      });

      expect(mockSession.start).not.toHaveBeenCalled();
    });
  });
});
