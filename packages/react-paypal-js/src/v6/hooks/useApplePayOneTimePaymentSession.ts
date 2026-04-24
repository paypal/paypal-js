import { useCallback, useEffect, useRef } from "react";

import { usePayPal } from "./usePayPal";
import { useIsMountedRef } from "./useIsMounted";
import { useError } from "./useError";
import { useProxyProps, createPaymentSession, toError } from "../utils";
import { INSTANCE_LOADING_STATE } from "../types/ProviderEnums";

import type {
  ApplePayOneTimePaymentSession,
  ApplePayConfig,
  ApplePayContact,
  ApplePayPaymentToken,
  ConfirmOrderResponse,
  BasePaymentSessionReturn,
} from "../types";

export type ApplePayLineItem = {
  label: string;
  amount: string;
  type?: "final" | "pending";
};

export type ApplePayPaymentRequest = {
  countryCode: string;
  currencyCode: string;
  total: ApplePayLineItem;
  requiredBillingContactFields?: string[];
  requiredShippingContactFields?: string[];
  shippingMethods?: unknown[];
  lineItems?: ApplePayLineItem[];
  applicationData?: string;
  /** Allows additional ApplePayPaymentRequest fields not explicitly typed above. */
  [key: string]: unknown;
};

export type UseApplePayOneTimePaymentSessionProps = {
  /**
   * Apple Pay configuration from findEligibleMethods.
   * Used to format the payment request with merchant capabilities and supported networks.
   */
  applePayConfig: ApplePayConfig;
  /**
   * Payment request configuration for Apple Pay.
   * This includes amount, country, currency, and other payment details.
   */
  paymentRequest: ApplePayPaymentRequest;
  /**
   * Optional display name for merchant validation.
   * Defaults to domain name if not provided.
   */
  displayName?: string;
  /**
   * Optional domain name for merchant validation.
   * Defaults to current domain if not provided.
   */
  domainName?: string;
  /**
   * Callback function to create an order.
   * Should return a promise that resolves to an object with orderId.
   */
  createOrder: () => Promise<{ orderId: string }>;
  /**
   * Callback invoked when the payment is successfully approved.
   */
  onApprove: (data: ConfirmOrderResponse) => void | Promise<void>;
  /**
   * Optional callback invoked when the payment is cancelled.
   */
  onCancel?: () => void;
  /**
   * Optional callback invoked when an error occurs.
   */
  onError?: (error: Error) => void;
  /**
   * Apple Pay JS API version passed to the ApplePaySession constructor.
   * Must be at least 4 (required by completePaymentMethodSelection update object form).
   * Higher versions unlock newer payment request features but require newer devices.
   */
  applePaySessionVersion: number;
};

/**
 * Hook for managing Apple Pay one-time payment sessions.
 *
 * This hook creates and manages a complete Apple Pay payment session, handling the entire
 * flow from button click through merchant validation to payment confirmation.
 *
 * @example
 * ```typescript
 * function ApplePayCheckoutButton() {
 *   const { sdkInstance } = usePayPal();
 *   const [applePayConfig, setApplePayConfig] = useState(null);
 *
 *   useEffect(() => {
 *     const fetchConfig = async () => {
 *       const methods = await sdkInstance?.findEligibleMethods({ currencyCode: "USD" });
 *       if (methods?.isEligible("applepay")) {
 *         setApplePayConfig(methods.getDetails("applepay").config);
 *       }
 *     };
 *     fetchConfig();
 *   }, [sdkInstance]);
 *
 *   const { isPending, error, handleClick } = useApplePayOneTimePaymentSession({
 *     applePayConfig,
 *     paymentRequest: {
 *       countryCode: "US",
 *       currencyCode: "USD",
 *       total: { label: "Demo Store", amount: "100.00", type: "final" },
 *     },
 *     createOrder: async () => {
 *       const response = await fetch("/api/orders", { method: "POST" });
 *       const data = await response.json();
 *       return { orderId: data.id };
 *     },
 *     onApprove: (data) => console.log("Payment approved:", data),
 *     onError: (err) => console.error("Payment error:", err),
 *   });
 *
 *   if (isPending || !applePayConfig) return null;
 *   if (error) return <div>Error: {error.message}</div>;
 *
 *   return (
 *     <apple-pay-button
 *       buttonstyle="black"
 *       type="buy"
 *       locale="en"
 *       onClick={handleClick}
 *     />
 *   );
 * }
 * ```
 */
export function useApplePayOneTimePaymentSession({
  applePayConfig,
  paymentRequest,
  displayName,
  domainName,
  createOrder,
  applePaySessionVersion,
  ...callbacks
}: UseApplePayOneTimePaymentSessionProps): BasePaymentSessionReturn {
  const { sdkInstance, loadingStatus } = usePayPal();
  const isMountedRef = useIsMountedRef();
  const sessionRef = useRef<ApplePayOneTimePaymentSession | null>(null);
  const activeApplePaySessionRef = useRef<{
    abort: () => void;
  } | null>(null);
  const proxyCallbacks = useProxyProps(callbacks);
  const [error, setError] = useError();

  // Prevents retrying session creation with a failed SDK instance
  const failedSdkRef = useRef<unknown>(null);

  const isPending = loadingStatus === INSTANCE_LOADING_STATE.PENDING;

  const handleCancel = useCallback(() => {
    if (activeApplePaySessionRef.current) {
      try {
        activeApplePaySessionRef.current.abort();
      } catch {
        // Session may already be complete
      }
      activeApplePaySessionRef.current = null;
    }
  }, []);

  const handleDestroy = useCallback(() => {
    handleCancel();
    sessionRef.current = null;
  }, [handleCancel]);

  // Handle SDK availability
  useEffect(() => {
    // Reset failed SDK tracking when SDK instance changes
    if (failedSdkRef.current !== sdkInstance) {
      failedSdkRef.current = null;
    }

    if (sdkInstance) {
      setError(null);
    } else if (loadingStatus !== INSTANCE_LOADING_STATE.PENDING) {
      setError(new Error("no sdk instance available"));
    }
  }, [sdkInstance, setError, loadingStatus]);

  // Create and manage session lifecycle
  useEffect(() => {
    if (!sdkInstance) {
      return;
    }

    const newSession = createPaymentSession({
      sessionCreator: () => sdkInstance.createApplePayOneTimePaymentSession(),
      failedSdkRef,
      sdkInstance,
      setError,
      errorMessage:
        'Failed to create payment session. This may occur if the required component "applepay-payments" is not included in the SDK components array.',
    });

    if (!newSession) {
      return;
    }

    sessionRef.current = newSession;

    return () => {
      sessionRef.current = null;
    };
  }, [sdkInstance, setError]);

  const handleClick = useCallback(async () => {
    if (!isMountedRef.current) {
      return;
    }

    // Clear any error from a previous attempt so the user can retry
    setError(null);

    if (!sessionRef.current) {
      setError(new Error("Apple Pay session not available"));
      return;
    }

    // Check if Apple Pay is available on this device/browser
    if (
      typeof window === "undefined" ||
      !window.ApplePaySession?.canMakePayments()
    ) {
      setError(new Error("Apple Pay is not available"));
      return;
    }

    // ApplePaySession constructor throws InvalidAccessError on non-HTTPS; provide a clearer message
    if (window.location.protocol !== "https:") {
      setError(new Error("Apple Pay requires a secure (HTTPS) connection"));
      return;
    }

    const { ApplePaySession: ApplePaySessionConstructor } = window;

    try {
      const paypalSession = sessionRef.current;

      // Format the payment request with Apple Pay config
      const formattedConfig =
        paypalSession.formatConfigForPaymentRequest(applePayConfig);

      const fullPaymentRequest = {
        ...paymentRequest,
        ...formattedConfig,
      };

      // Create Apple's native payment session
      const applePaySession = new ApplePaySessionConstructor(
        applePaySessionVersion,
        fullPaymentRequest,
      );
      activeApplePaySessionRef.current = applePaySession;

      // Handle merchant validation
      applePaySession.onvalidatemerchant = async (event: {
        validationURL: string;
      }) => {
        try {
          const payload = await paypalSession.validateMerchant({
            validationUrl: event.validationURL,
            ...(displayName && { displayName }),
            ...(domainName && { domainName }),
          });
          applePaySession.completeMerchantValidation(payload.merchantSession);
        } catch (err) {
          const merchantError = toError(err);
          setError(merchantError);
          proxyCallbacks.onError?.(merchantError);
          applePaySession.abort();
        }
      };

      // Handle payment method selection
      applePaySession.onpaymentmethodselected = () => {
        applePaySession.completePaymentMethodSelection({
          newTotal: paymentRequest.total,
        });
      };

      // Handle payment authorization
      applePaySession.onpaymentauthorized = async (event: {
        payment: {
          token: ApplePayPaymentToken;
          billingContact: ApplePayContact;
          shippingContact?: ApplePayContact;
        };
      }) => {
        try {
          // Create the order
          const order = await createOrder();

          // Confirm the order with PayPal
          const confirmResult = await paypalSession.confirmOrder({
            orderId: order.orderId,
            token: event.payment.token,
            billingContact: event.payment.billingContact,
            shippingContact: event.payment.shippingContact,
          });

          // Complete the Apple Pay session successfully
          applePaySession.completePayment({
            status: ApplePaySessionConstructor.STATUS_SUCCESS,
          });

          // Call onApprove callback
          await proxyCallbacks.onApprove(confirmResult);
        } catch (err) {
          const paymentError = toError(err);
          setError(paymentError);
          proxyCallbacks.onError?.(paymentError);
          applePaySession.completePayment({
            status: ApplePaySessionConstructor.STATUS_FAILURE,
          });
        }
      };

      // Handle cancellation
      applePaySession.oncancel = () => {
        activeApplePaySessionRef.current = null;
        proxyCallbacks.onCancel?.();
      };

      // Begin the Apple Pay session
      applePaySession.begin();
    } catch (err) {
      const sessionError = toError(err);
      setError(sessionError);
      proxyCallbacks.onError?.(sessionError);
    }
  }, [
    isMountedRef,
    applePayConfig,
    paymentRequest,
    displayName,
    domainName,
    createOrder,
    applePaySessionVersion,
    proxyCallbacks,
    setError,
  ]);

  return {
    error,
    isPending,
    handleClick,
    handleCancel,
    handleDestroy,
  };
}
