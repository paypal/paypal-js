/**
 * @jest-environment jsdom
 */
import { renderHook, act } from "@testing-library/react-hooks";

import { expectCurrentErrorValue } from "./useErrorTestUtil";
import { useGooglePayOneTimePaymentSession } from "./useGooglePayOneTimePaymentSession";
import {
  mockPayPalContext,
  mockPayPalRejected,
  mockPayPalPending,
} from "./usePayPalTestUtils";
import { useProxyProps } from "../utils";

import type { UseGooglePayOneTimePaymentSessionProps } from "./useGooglePayOneTimePaymentSession";
import type {
  GooglePayOneTimePaymentSession,
  GooglePayConfigFromFindEligibleMethods,
} from "../types";

jest.mock("./usePayPal");

jest.mock("../utils", () => ({
  ...jest.requireActual("../utils"),
  useProxyProps: jest.fn(),
}));

const mockUseProxyProps = useProxyProps as jest.MockedFunction<
  typeof useProxyProps
>;

let stableProxyCallbacks: Record<string, unknown> | null = null;

// Mock Google Pay PaymentsClient
let capturedOnPaymentAuthorized:
  | ((paymentData: unknown) => Promise<unknown>)
  | null = null;

let mockLoadPaymentData = jest.fn().mockResolvedValue(undefined);

class MockPaymentsClient {
  loadPaymentData: jest.Mock;
  isReadyToPay = jest.fn().mockResolvedValue({ result: true });
  createButton = jest.fn().mockReturnValue(document.createElement("div"));

  constructor(config: {
    environment: string;
    paymentDataCallbacks?: {
      onPaymentAuthorized?: (paymentData: unknown) => Promise<unknown>;
    };
  }) {
    this.loadPaymentData = mockLoadPaymentData;
    capturedOnPaymentAuthorized =
      config.paymentDataCallbacks?.onPaymentAuthorized ?? null;
  }
}

const setupGooglePayGlobal = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).google = {
    payments: {
      api: {
        PaymentsClient: MockPaymentsClient,
      },
    },
  };
};

const removeGooglePayGlobal = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  delete (window as any).google;
};

const createMockGooglePaySession = (): GooglePayOneTimePaymentSession => ({
  formatConfigForPaymentRequest: jest.fn().mockReturnValue({
    allowedPaymentMethods: [
      {
        type: "CARD",
        parameters: {
          allowedAuthMethods: ["CRYPTOGRAM_3DS", "PAN_ONLY"],
          allowedCardNetworks: ["VISA", "MASTERCARD"],
        },
        tokenizationSpecification: {
          type: "PAYMENT_GATEWAY",
          parameters: {
            gateway: "paypal",
            gatewayMerchantId: "test-merchant-id",
          },
        },
      },
    ],
    apiVersion: 2,
    apiVersionMinor: 0,
    countryCode: "US",
    merchantInfo: {
      merchantId: "test-merchant-id",
      merchantOrigin: "example.com",
    },
  }),
  getGooglePayConfig: jest.fn().mockResolvedValue({
    allowedPaymentMethods: [],
    merchantInfo: {
      authJwt: "test-jwt",
      merchantId: "test-merchant-id",
      merchantName: "Test Store",
      merchantOrigin: "example.com",
    },
  }),
  confirmOrder: jest.fn().mockResolvedValue({
    id: "test-order-id",
    status: "APPROVED",
    payment_source: {
      google_pay: {
        name: "Test User",
        card: {
          last_digits: "1234",
          type: "CREDIT",
          brand: "VISA",
        },
      },
    },
    links: [],
  }),
  initiatePayerAction: jest.fn(),
});

const createMockSdkInstance = (
  googlePaySession = createMockGooglePaySession(),
) => ({
  createGooglePayOneTimePaymentSession: jest
    .fn()
    .mockReturnValue(googlePaySession),
});

const mockGooglePayConfig: GooglePayConfigFromFindEligibleMethods = {
  eligible: true,
  merchantCountry: "US",
  apiVersion: 2,
  apiVersionMinor: 0,
  allowedPaymentMethods: [
    {
      type: "CARD",
      parameters: {
        allowedAuthMethods: ["CRYPTOGRAM_3DS", "PAN_ONLY"],
        supportedNetworks: ["VISA", "MASTERCARD"],
        billingAddressRequired: true,
        assuranceDetailsRequired: true,
        billingAddressParameters: {
          format: "FULL",
        },
      },
      tokenizationSpecification: {
        type: "PAYMENT_GATEWAY",
        parameters: {
          gateway: "paypal",
          gatewayMerchantId: "test-merchant-id",
        },
      },
    },
  ],
  merchantInfo: {
    merchantOrigin: "example.com",
    merchantId: "test-merchant-id",
  },
};

const mockPaymentData = {
  paymentMethodData: {
    description: "Visa •••• 1234",
    tokenizationData: {
      type: "PAYMENT_GATEWAY",
      token: '{"signature":"test"}',
    },
    type: "CARD",
    info: {
      cardDetails: "1234",
      cardNetwork: "VISA",
      assuranceDetails: {
        accountVerified: true,
        cardHolderAuthenticated: true,
      },
    },
  },
};

describe("useGooglePayOneTimePaymentSession", () => {
  let mockGooglePaySession: GooglePayOneTimePaymentSession;
  let mockSdkInstance: ReturnType<typeof createMockSdkInstance>;
  let defaultProps: UseGooglePayOneTimePaymentSessionProps;

  beforeEach(() => {
    stableProxyCallbacks = null;
    mockUseProxyProps.mockImplementation((callbacks) => {
      if (!stableProxyCallbacks) {
        stableProxyCallbacks = { ...callbacks };
        return stableProxyCallbacks;
      }

      Object.assign(stableProxyCallbacks, callbacks);
      return stableProxyCallbacks;
    });

    setupGooglePayGlobal();

    mockGooglePaySession = createMockGooglePaySession();
    mockSdkInstance = createMockSdkInstance(mockGooglePaySession);

    mockPayPalContext({ sdkInstance: mockSdkInstance });

    capturedOnPaymentAuthorized = null;
    mockLoadPaymentData = jest.fn().mockResolvedValue(undefined);

    defaultProps = {
      googlePayConfig: mockGooglePayConfig,
      transactionInfo: {
        countryCode: "US",
        currencyCode: "USD",
        totalPriceStatus: "FINAL",
        totalPrice: "100.00",
      },
      environment: "TEST",
      createOrder: jest.fn().mockResolvedValue({ orderId: "ORDER-123" }),
      onApprove: jest.fn(),
      onCancel: jest.fn(),
      onError: jest.fn(),
    };
  });

  afterEach(() => {
    removeGooglePayGlobal();
    jest.clearAllMocks();
  });

  describe("initialization", () => {
    test("should not create session when no SDK instance is available", () => {
      mockPayPalRejected();

      const {
        result: {
          current: { error },
        },
      } = renderHook(() => useGooglePayOneTimePaymentSession(defaultProps));

      expectCurrentErrorValue(error);

      expect(error).toEqual(new Error("no sdk instance available"));
      expect(
        mockSdkInstance.createGooglePayOneTimePaymentSession,
      ).not.toHaveBeenCalled();
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
      "should handle $description thrown by createGooglePayOneTimePaymentSession",
      ({ thrownError }) => {
        const mockSdkInstanceWithError = {
          createGooglePayOneTimePaymentSession: jest
            .fn()
            .mockImplementation(() => {
              throw thrownError;
            }),
        };

        mockPayPalContext({ sdkInstance: mockSdkInstanceWithError });

        const {
          result: {
            current: { error },
          },
        } = renderHook(() => useGooglePayOneTimePaymentSession(defaultProps));

        expectCurrentErrorValue(error);

        expect(
          mockSdkInstanceWithError.createGooglePayOneTimePaymentSession,
        ).toHaveBeenCalledTimes(1);
      },
    );

    test("should create session successfully with valid SDK instance", () => {
      const {
        result: {
          current: { error },
        },
      } = renderHook(() => useGooglePayOneTimePaymentSession(defaultProps));

      expect(error).toBeNull();
      expect(
        mockSdkInstance.createGooglePayOneTimePaymentSession,
      ).toHaveBeenCalledTimes(1);
    });

    test("should set isPending to true when SDK is loading", () => {
      mockPayPalPending();

      const {
        result: {
          current: { isPending, error },
        },
      } = renderHook(() => useGooglePayOneTimePaymentSession(defaultProps));

      expect(isPending).toBe(true);
      expect(error).toBeNull();
    });

    test("should set isPending to false when SDK is ready", () => {
      const {
        result: {
          current: { isPending },
        },
      } = renderHook(() => useGooglePayOneTimePaymentSession(defaultProps));

      expect(isPending).toBe(false);
    });
  });

  describe("session setup", () => {
    test("should call formatConfigForPaymentRequest with googlePayConfig", () => {
      renderHook(() => useGooglePayOneTimePaymentSession(defaultProps));

      expect(
        mockGooglePaySession.formatConfigForPaymentRequest,
      ).toHaveBeenCalledWith(mockGooglePayConfig);
    });

    test("should pass environment to PaymentsClient", async () => {
      const { result } = renderHook(() =>
        useGooglePayOneTimePaymentSession({
          ...defaultProps,
          environment: "PRODUCTION",
        }),
      );

      await act(async () => {
        await result.current.handleClick();
      });

      // The PaymentsClient was constructed (verified via capturedOnPaymentAuthorized being set)
      expect(capturedOnPaymentAuthorized).not.toBeNull();
    });
  });

  describe("createGooglePayButton", () => {
    test("should check readiness and create button", async () => {
      const { result } = renderHook(() =>
        useGooglePayOneTimePaymentSession(defaultProps),
      );

      const options = {
        onClick: jest.fn(),
        buttonType: "pay" as const,
      };

      let button: HTMLElement | null = null;
      await act(async () => {
        button = await result.current.createGooglePayButton(options);
      });

      expect(result.current.paymentsClient).not.toBeNull();
      expect(result.current.paymentsClient?.isReadyToPay).toHaveBeenCalledWith({
        allowedPaymentMethods:
          result.current.formattedConfig?.allowedPaymentMethods,
        apiVersion: result.current.formattedConfig?.apiVersion,
        apiVersionMinor: result.current.formattedConfig?.apiVersionMinor,
      });
      expect(result.current.paymentsClient?.createButton).toHaveBeenCalledWith(
        options,
      );
      expect(button).toBeInstanceOf(HTMLElement);
    });

    test("should return null when Google Pay is not ready", async () => {
      const { result } = renderHook(() =>
        useGooglePayOneTimePaymentSession(defaultProps),
      );

      (
        result.current.paymentsClient?.isReadyToPay as jest.Mock
      ).mockResolvedValue({
        result: false,
      });

      let button: HTMLElement | null = null;
      await act(async () => {
        button = await result.current.createGooglePayButton({
          onClick: jest.fn(),
        });
      });

      expect(button).toBeNull();
      expect(
        result.current.paymentsClient?.createButton,
      ).not.toHaveBeenCalled();
    });

    test("should set error and call onError when setup fails", async () => {
      const { result } = renderHook(() =>
        useGooglePayOneTimePaymentSession(defaultProps),
      );

      (
        result.current.paymentsClient?.isReadyToPay as jest.Mock
      ).mockRejectedValue(new Error("isReadyToPay failed"));

      await act(async () => {
        await result.current.createGooglePayButton({ onClick: jest.fn() });
      });

      expect(result.current.error?.message).toBe("isReadyToPay failed");
      expect(defaultProps.onError).toHaveBeenCalled();
    });
  });

  describe("handleClick - payment flow", () => {
    test("should handle payment authorization, confirm order, and call onApprove", async () => {
      const { result } = renderHook(() =>
        useGooglePayOneTimePaymentSession(defaultProps),
      );

      await act(async () => {
        await result.current.handleClick();
      });

      expect(capturedOnPaymentAuthorized).not.toBeNull();

      let authResult: unknown;
      await act(async () => {
        authResult = await capturedOnPaymentAuthorized!(mockPaymentData);
      });

      expect(defaultProps.createOrder).toHaveBeenCalled();
      expect(mockGooglePaySession.confirmOrder).toHaveBeenCalledWith({
        orderId: "ORDER-123",
        paymentMethodData: mockPaymentData.paymentMethodData,
      });
      expect(defaultProps.onApprove).toHaveBeenCalled();
      expect(authResult).toEqual({ transactionState: "SUCCESS" });
    });

    test("should handle 3DS PAYER_ACTION_REQUIRED response", async () => {
      (mockGooglePaySession.confirmOrder as jest.Mock).mockResolvedValue({
        id: "test-order-id",
        status: "PAYER_ACTION_REQUIRED",
        payment_source: {
          google_pay: {
            name: "Test User",
            card: {
              last_digits: "1234",
              type: "CREDIT",
              brand: "VISA",
            },
          },
        },
        links: [
          {
            href: "https://example.com/3ds",
            rel: "payer-action",
            method: "GET",
          },
        ],
      });

      const { result } = renderHook(() =>
        useGooglePayOneTimePaymentSession(defaultProps),
      );

      await act(async () => {
        await result.current.handleClick();
      });

      expect(capturedOnPaymentAuthorized).not.toBeNull();

      let authResult: unknown;
      await act(async () => {
        authResult = await capturedOnPaymentAuthorized!(mockPaymentData);
      });

      expect(mockGooglePaySession.initiatePayerAction).toHaveBeenCalled();
      expect(defaultProps.onApprove).toHaveBeenCalled();
      expect(authResult).toEqual({ transactionState: "SUCCESS" });
    });

    test("should error when Google Pay SDK is not available", async () => {
      removeGooglePayGlobal();

      const { result } = renderHook(() =>
        useGooglePayOneTimePaymentSession(defaultProps),
      );

      await act(async () => {
        await result.current.handleClick();
      });

      expect(result.current.error?.message).toBe(
        "Google Pay client is not available",
      );
    });

    test("should error when session is not available", async () => {
      mockPayPalRejected();

      const { result } = renderHook(() =>
        useGooglePayOneTimePaymentSession(defaultProps),
      );

      await act(async () => {
        await result.current.handleClick();
      });

      expect(result.current.error?.message).toBe(
        "Google Pay session not available",
      );
    });
  });

  describe("handleClick - error handling", () => {
    test.each([
      {
        description: "Error object",
        rejectedValue: new Error("Confirmation failed"),
        expectedMessage: "Confirmation failed",
      },
      {
        description: "non-Error string (normalized via toError)",
        rejectedValue: "string error",
        expectedMessage: "string error",
      },
    ])(
      "should handle order confirmation $description and return ERROR",
      async ({ rejectedValue, expectedMessage }) => {
        (mockGooglePaySession.confirmOrder as jest.Mock).mockRejectedValue(
          rejectedValue,
        );

        const { result } = renderHook(() =>
          useGooglePayOneTimePaymentSession(defaultProps),
        );

        await act(async () => {
          await result.current.handleClick();
        });

        expect(capturedOnPaymentAuthorized).not.toBeNull();

        let authResult: unknown;
        await act(async () => {
          authResult = await capturedOnPaymentAuthorized!(mockPaymentData);
        });

        expect(result.current.error).toBeInstanceOf(Error);
        expect(result.current.error?.message).toBe(expectedMessage);
        expect(defaultProps.onError).toHaveBeenCalled();
        expect(authResult).toEqual(
          expect.objectContaining({
            transactionState: "ERROR",
          }),
        );
      },
    );

    test("should handle createOrder failure", async () => {
      (defaultProps.createOrder as jest.Mock).mockRejectedValue(
        new Error("Order creation failed"),
      );

      const { result } = renderHook(() =>
        useGooglePayOneTimePaymentSession(defaultProps),
      );

      await act(async () => {
        await result.current.handleClick();
      });

      expect(capturedOnPaymentAuthorized).not.toBeNull();

      let authResult: unknown;
      await act(async () => {
        authResult = await capturedOnPaymentAuthorized!(mockPaymentData);
      });

      expect(result.current.error?.message).toBe("Order creation failed");
      expect(defaultProps.onError).toHaveBeenCalled();
      expect(authResult).toEqual(
        expect.objectContaining({
          transactionState: "ERROR",
        }),
      );
    });

    test("should call onCancel when user dismisses Google Pay sheet", async () => {
      // Simulate the MockPaymentsClient rejecting with CANCELED statusCode
      mockLoadPaymentData = jest
        .fn()
        .mockRejectedValue({ statusCode: "CANCELED" });

      const { result } = renderHook(() =>
        useGooglePayOneTimePaymentSession(defaultProps),
      );

      await act(async () => {
        await result.current.handleClick();
      });

      expect(defaultProps.onCancel).toHaveBeenCalled();
      expect(result.current.error).toBeNull();
    });

    test("should ignore non-cancel loadPaymentData rejection", async () => {
      mockLoadPaymentData = jest
        .fn()
        .mockRejectedValue(new Error("Payment data load failed"));

      const { result } = renderHook(() =>
        useGooglePayOneTimePaymentSession(defaultProps),
      );

      await act(async () => {
        await result.current.handleClick();
      });

      expect(result.current.error).toBeNull();
      expect(defaultProps.onError).not.toHaveBeenCalled();
    });

    test("should not call onError twice when authorization fails and sheet closes", async () => {
      (mockGooglePaySession.confirmOrder as jest.Mock).mockRejectedValue(
        new Error("Confirmation failed"),
      );

      mockLoadPaymentData = jest.fn().mockImplementation(async () => {
        if (capturedOnPaymentAuthorized) {
          await capturedOnPaymentAuthorized(mockPaymentData);
        }

        throw new Error("Payment sheet closed after authorization error");
      });

      const { result } = renderHook(() =>
        useGooglePayOneTimePaymentSession(defaultProps),
      );

      await act(async () => {
        await result.current.handleClick();
      });

      expect(result.current.error?.message).toBe("Confirmation failed");
      expect(defaultProps.onError).toHaveBeenCalledTimes(1);
    });

    test("should clear error when SDK instance becomes available", () => {
      const { rerender, result } = renderHook(() =>
        useGooglePayOneTimePaymentSession(defaultProps),
      );

      // Initially has SDK
      expect(result.current.error).toBeNull();

      // Simulate SDK becoming unavailable
      mockPayPalRejected();
      rerender();

      expect(result.current.error).not.toBeNull();

      // SDK becomes available again
      mockPayPalContext({ sdkInstance: mockSdkInstance });
      rerender();

      expect(result.current.error).toBeNull();
    });
  });

  describe("handleDestroy", () => {
    test("should nullify session and prevent further clicks after handleDestroy", async () => {
      const { result } = renderHook(() =>
        useGooglePayOneTimePaymentSession(defaultProps),
      );

      // Verify session works initially
      expect(result.current.error).toBeNull();

      act(() => {
        result.current.handleDestroy();
      });

      // After destroy, handleClick should error because sessionRef is null
      await act(async () => {
        await result.current.handleClick();
      });

      expect(result.current.error?.message).toBe(
        "Google Pay session not available",
      );
    });
  });

  describe("cleanup", () => {
    test("should not retry session creation after SDK error", () => {
      const mockSdkInstanceWithError = {
        createGooglePayOneTimePaymentSession: jest
          .fn()
          .mockImplementation(() => {
            throw new Error("SDK error");
          }),
      };

      mockPayPalContext({ sdkInstance: mockSdkInstanceWithError });

      const { rerender } = renderHook(() =>
        useGooglePayOneTimePaymentSession(defaultProps),
      );

      // First attempt
      expect(
        mockSdkInstanceWithError.createGooglePayOneTimePaymentSession,
      ).toHaveBeenCalledTimes(1);

      // Rerender should not trigger another attempt with same failed SDK
      rerender();

      expect(
        mockSdkInstanceWithError.createGooglePayOneTimePaymentSession,
      ).toHaveBeenCalledTimes(1);
    });

    test("should retry session creation when SDK instance changes", () => {
      const mockSdkInstanceWithError = {
        createGooglePayOneTimePaymentSession: jest
          .fn()
          .mockImplementation(() => {
            throw new Error("SDK error");
          }),
      };

      mockPayPalContext({ sdkInstance: mockSdkInstanceWithError });

      const { rerender } = renderHook(() =>
        useGooglePayOneTimePaymentSession(defaultProps),
      );

      expect(
        mockSdkInstanceWithError.createGooglePayOneTimePaymentSession,
      ).toHaveBeenCalledTimes(1);

      // New SDK instance should trigger retry
      const newMockSdkInstance = createMockSdkInstance();
      mockPayPalContext({ sdkInstance: newMockSdkInstance });
      rerender();

      expect(
        newMockSdkInstance.createGooglePayOneTimePaymentSession,
      ).toHaveBeenCalledTimes(1);
    });
  });
});
