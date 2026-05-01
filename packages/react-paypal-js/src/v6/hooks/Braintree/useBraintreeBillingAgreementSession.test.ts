import { renderHook, act } from "@testing-library/react-hooks";

import { expectCurrentErrorValue } from "../useErrorTestUtil";
import { useBraintreeBillingAgreementSession } from "./useBraintreeBillingAgreementSession";
import { useBraintreePayPal } from "./useBraintreePayPal";
import { useProxyProps } from "../../utils";
import { INSTANCE_LOADING_STATE } from "../../types/ProviderEnums";

import type { BraintreePaymentSession } from "../../types/braintree";
import type { BraintreePayPalState } from "../../context/BraintreePayPalContext";
import type { UseBraintreeBillingAgreementSessionProps } from "./useBraintreeBillingAgreementSession";

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
  createBillingAgreementSession: jest.fn().mockReturnValue(session),
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

describe("useBraintreeBillingAgreementSession", () => {
  let mockSession: BraintreePaymentSession;
  let mockCheckoutInstance: ReturnType<typeof createMockCheckoutInstance>;

  const defaultProps: UseBraintreeBillingAgreementSessionProps = {
    billingAgreementDescription: "Test billing agreement",
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
      } = renderHook(() => useBraintreeBillingAgreementSession(defaultProps));

      expectCurrentErrorValue(error);

      expect(error).toEqual(
        new Error("Braintree checkout instance not available"),
      );
      expect(
        mockCheckoutInstance.createBillingAgreementSession,
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
      "should handle $description thrown by createBillingAgreementSession",
      ({ thrownError }) => {
        const mockCheckoutInstanceWithError = {
          createBillingAgreementSession: jest.fn().mockImplementation(() => {
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
        } = renderHook(() => useBraintreeBillingAgreementSession(defaultProps));

        expectCurrentErrorValue(error);

        expect(error?.message).toContain(
          "Failed to create Braintree billing agreement session",
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
      } = renderHook(() => useBraintreeBillingAgreementSession(defaultProps));

      expect(error).toBeNull();
    });

    test("should clear errors when checkout instance becomes available", () => {
      mockBraintreeRejected();

      const { result, rerender } = renderHook(() =>
        useBraintreeBillingAgreementSession(defaultProps),
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
          useBraintreeBillingAgreementSession(defaultProps),
        );

        expect(result.current.isPending).toBe(expectedIsPending);
      },
    );

    test("should create a session with the correct options", () => {
      const onApprove = jest.fn();
      const onCancel = jest.fn();
      const onError = jest.fn();

      const props: UseBraintreeBillingAgreementSessionProps = {
        billingAgreementDescription: "Premium subscription",
        planType: "SUBSCRIPTION",
        planMetadata: {
          currencyIsoCode: "USD",
          name: "Premium Plan",
          billingCycles: [
            {
              billingFrequency: 1,
              billingFrequencyUnit: "MONTH",
              numberOfExecutions: 0,
              sequence: 1,
              startDate: "2025-12-01T00:00:00Z",
              trial: false,
              pricingScheme: { pricingModel: "FIXED", price: "9.99" },
            },
          ],
        },
        amount: "9.99",
        currency: "USD",
        offerCredit: true,
        displayName: "Test Store",
        presentationMode: "popup",
        onApprove,
        onCancel,
        onError,
      };

      renderHook(() => useBraintreeBillingAgreementSession(props));

      expect(
        mockCheckoutInstance.createBillingAgreementSession,
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          billingAgreementDescription: "Premium subscription",
          planType: "SUBSCRIPTION",
          planMetadata: expect.objectContaining({
            currencyIsoCode: "USD",
            name: "Premium Plan",
          }),
          amount: "9.99",
          currency: "USD",
          offerCredit: true,
          displayName: "Test Store",
          presentationMode: "popup",
          onApprove,
          onCancel,
          onError,
        }),
      );
    });

    test("should forward callback invocations to the consumer", () => {
      const onApprove = jest.fn();
      const onCancel = jest.fn();
      const onError = jest.fn();

      const props: UseBraintreeBillingAgreementSessionProps = {
        billingAgreementDescription: "Test agreement",
        onApprove,
        onCancel,
        onError,
      };

      renderHook(() => useBraintreeBillingAgreementSession(props));

      const createSessionCall =
        mockCheckoutInstance.createBillingAgreementSession.mock.calls[0][0];

      const mockApprovalData = {
        billingToken: "BA-TOKEN123",
      };
      createSessionCall.onApprove(mockApprovalData);
      const mockCancelData = { billingToken: "BA-TOKEN123" };
      createSessionCall.onCancel(mockCancelData);
      createSessionCall.onError(new Error("test error"));

      expect(onApprove).toHaveBeenCalledWith(mockApprovalData);
      expect(onCancel).toHaveBeenCalledWith(mockCancelData);
      expect(onError).toHaveBeenCalledWith(new Error("test error"));
    });
  });

  describe("session lifecycle", () => {
    test("should nullify session on unmount", () => {
      const { result, unmount } = renderHook(() =>
        useBraintreeBillingAgreementSession(defaultProps),
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
        ({ billingAgreementDescription }) =>
          useBraintreeBillingAgreementSession({
            billingAgreementDescription,
            onApprove,
          }),
        { initialProps: { billingAgreementDescription: "First agreement" } },
      );

      expect(
        mockCheckoutInstance.createBillingAgreementSession,
      ).toHaveBeenCalledTimes(1);

      jest.clearAllMocks();

      rerender({ billingAgreementDescription: "Updated agreement" });

      expect(
        mockCheckoutInstance.createBillingAgreementSession,
      ).toHaveBeenCalledTimes(1);
      expect(
        mockCheckoutInstance.createBillingAgreementSession,
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          billingAgreementDescription: "Updated agreement",
        }),
      );
    });

    test("should recreate session when checkout instance changes", () => {
      const { rerender } = renderHook(() =>
        useBraintreeBillingAgreementSession(defaultProps),
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
        newMockCheckoutInstance.createBillingAgreementSession,
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
          useBraintreeBillingAgreementSession({
            billingAgreementDescription: "Test agreement",
            onApprove,
          }),
        { initialProps: { onApprove: initialOnApprove } },
      );

      jest.clearAllMocks();

      rerender({ onApprove: newOnApprove });

      expect(
        mockCheckoutInstance.createBillingAgreementSession,
      ).not.toHaveBeenCalled();
    });

    test("should not recreate session when inline object options have the same values", () => {
      mockUseProxyProps.mockImplementation(
        jest.requireActual("../../utils").useProxyProps,
      );

      const planMetadata = {
        currencyIsoCode: "USD",
        name: "Premium Plan",
        billingCycles: [
          {
            billingFrequency: 1,
            billingFrequencyUnit: "MONTH" as const,
            numberOfExecutions: 0,
            sequence: 1,
            startDate: "2025-12-01T00:00:00Z",
            trial: false,
            pricingScheme: {
              pricingModel: "FIXED" as const,
              price: "9.99",
            },
          },
        ],
      };

      const { rerender } = renderHook(
        ({ planMetadata }) =>
          useBraintreeBillingAgreementSession({
            billingAgreementDescription: "Test agreement",
            onApprove: jest.fn(),
            planType: "SUBSCRIPTION",
            planMetadata,
          }),
        { initialProps: { planMetadata } },
      );

      jest.clearAllMocks();

      rerender({
        planMetadata: {
          currencyIsoCode: "USD",
          name: "Premium Plan",
          billingCycles: [
            {
              billingFrequency: 1,
              billingFrequencyUnit: "MONTH" as const,
              numberOfExecutions: 0,
              sequence: 1,
              startDate: "2025-12-01T00:00:00Z",
              trial: false,
              pricingScheme: {
                pricingModel: "FIXED" as const,
                price: "9.99",
              },
            },
          ],
        },
      });

      expect(
        mockCheckoutInstance.createBillingAgreementSession,
      ).not.toHaveBeenCalled();
    });

    test("should not retry session creation on a failed checkout instance", () => {
      const mockCheckoutInstanceWithError = {
        createBillingAgreementSession: jest.fn().mockImplementation(() => {
          throw new Error("init failure");
        }),
      };

      mockBraintreeContext({
        braintreePayPalCheckoutInstance: mockCheckoutInstanceWithError,
      });

      const { rerender } = renderHook(() =>
        useBraintreeBillingAgreementSession(defaultProps),
      );

      expect(
        mockCheckoutInstanceWithError.createBillingAgreementSession,
      ).toHaveBeenCalledTimes(1);

      jest.clearAllMocks();

      rerender();

      expect(
        mockCheckoutInstanceWithError.createBillingAgreementSession,
      ).not.toHaveBeenCalled();
    });

    test("should retry session creation when a new checkout instance replaces a failed one", () => {
      mockUseProxyProps.mockImplementation(
        jest.requireActual("../../utils").useProxyProps,
      );

      const mockCheckoutInstanceWithError = {
        createBillingAgreementSession: jest.fn().mockImplementation(() => {
          throw new Error("init failure");
        }),
      };

      mockBraintreeContext({
        braintreePayPalCheckoutInstance: mockCheckoutInstanceWithError,
      });

      const { rerender } = renderHook(() =>
        useBraintreeBillingAgreementSession(defaultProps),
      );

      expect(
        mockCheckoutInstanceWithError.createBillingAgreementSession,
      ).toHaveBeenCalledTimes(1);

      const newMockSession = createMockSession();
      const newMockCheckoutInstance =
        createMockCheckoutInstance(newMockSession);

      mockBraintreeContext({
        braintreePayPalCheckoutInstance: newMockCheckoutInstance,
      });

      rerender();

      expect(
        newMockCheckoutInstance.createBillingAgreementSession,
      ).toHaveBeenCalledTimes(1);
    });
  });

  describe("handleClick", () => {
    test("should call session.start() when session is available", () => {
      const { result } = renderHook(() =>
        useBraintreeBillingAgreementSession(defaultProps),
      );

      act(() => {
        result.current.handleClick();
      });

      expect(mockSession.start).toHaveBeenCalled();
    });

    test("should set error when session is not available", () => {
      mockBraintreeRejected();

      const { result } = renderHook(() =>
        useBraintreeBillingAgreementSession(defaultProps),
      );

      act(() => {
        result.current.handleClick();
      });

      const { error } = result.current;

      expectCurrentErrorValue(error);

      expect(error).toEqual(
        new Error("Braintree billing agreement session not available"),
      );
    });

    test("should not call start after component is unmounted", () => {
      const { result, unmount } = renderHook(() =>
        useBraintreeBillingAgreementSession(defaultProps),
      );

      unmount();

      act(() => {
        result.current.handleClick();
      });

      expect(mockSession.start).not.toHaveBeenCalled();
    });
  });
});
