import { useCallback, useEffect, useRef, useState } from "react";

import { usePayPal } from "./usePayPal";
import { useIsMountedRef } from "./useIsMounted";
import { useError } from "./useError";
import { useProxyProps, createPaymentSession, toError } from "../utils";
import { INSTANCE_LOADING_STATE } from "../types/ProviderEnums";

import type {
  GooglePayOneTimePaymentSession,
  GooglePayConfig,
  GooglePayConfigFromFindEligibleMethods,
  GooglePayPaymentMethodData,
  GooglePayButtonOptions,
  GooglePayApprovePaymentResponse,
  GooglePayTransactionInfo,
  BasePaymentSessionReturn,
} from "../types";

export type UseGooglePayOneTimePaymentSessionProps = {
  /**
   * Google Pay configuration from findEligibleMethods.
   * Used to format the payment request with allowed payment methods and merchant info.
   */
  googlePayConfig: GooglePayConfigFromFindEligibleMethods;
  /**
   * Transaction info for the Google Pay payment request.
   */
  transactionInfo: GooglePayTransactionInfo;
  /**
   * Google Pay environment. Use "TEST" for sandbox and "PRODUCTION" for live.
   * @default "TEST"
   */
  environment?: "TEST" | "PRODUCTION";
  /**
   * Callback function to create an order.
   * Should return a promise that resolves to an object with orderId.
   */
  createOrder: () => Promise<{ orderId: string }>;
  /**
   * Callback invoked when the payment is successfully approved.
   */
  onApprove: (data: GooglePayApprovePaymentResponse) => void | Promise<void>;
  /**
   * Optional callback invoked when the payment is cancelled.
   */
  onCancel?: () => void;
  /**
   * Optional callback invoked when an error occurs.
   */
  onError?: (error: Error) => void;
};

export type UseGooglePayOneTimePaymentSessionReturn =
  BasePaymentSessionReturn & {
    /**
     * The Google Pay PaymentsClient instance.
     * Used internally to check readiness and create the payment button.
     * Advanced users may interact with this directly if needed.
     * @default null (until session is fully initialized)
     */
    paymentsClient: google.payments.api.PaymentsClient | null;
    /**
     * The formatted Google Pay configuration for the payment request.
     * Includes allowed payment methods, merchant info, and API versions.
     * @default null (until session is fully initialized)
     */
    formattedConfig: GooglePayConfig | null;
    /**
     * Creates the native Google Pay button after checking eligibility via isReadyToPay.
     * Setup errors are captured in hook state and forwarded to onError.
     */
    createGooglePayButton: (
      options: GooglePayButtonOptions,
    ) => Promise<HTMLElement | null>;
  };

/**
 * Hook for managing Google Pay one-time payment sessions.
 *
 * This hook creates and manages a complete Google Pay payment session, handling the entire
 * flow from button click through payment authorization to order confirmation.
 *
 * Unlike Apple Pay and Venmo (which use web components), Google Pay uses Google's PaymentsClient
 * to drive the payment UI. This hook returns the PaymentsClient and formatted config so the
 * GooglePayOneTimePaymentButton component can:
 * 1. Check device/browser readiness with `isReadyToPay()`
 * 2. Create the native Google Pay button before user interaction
 * 3. Load payment data and handle payment callbacks
 *
 * The hook manages the entire session lifecycle including order creation, payment confirmation,
 * 3DS (PAYER_ACTION_REQUIRED) handling, and error management.
 *
 * @example
 * ```typescript
 * function GooglePayCheckoutButton() {
 *   const { sdkInstance } = usePayPal();
 *   const [googlePayConfig, setGooglePayConfig] = useState(null);
 *
 *   useEffect(() => {
 *     const fetchConfig = async () => {
 *       const methods = await sdkInstance?.findEligibleMethods({ currencyCode: "USD" });
 *       if (methods?.isEligible("googlepay")) {
 *         setGooglePayConfig(methods.getDetails("googlepay").config);
 *       }
 *     };
 *     fetchConfig();
 *   }, [sdkInstance]);
 *
 *   const { isPending, error, handleClick } = useGooglePayOneTimePaymentSession({
 *     googlePayConfig,
 *     transactionInfo: {
 *       countryCode: "US",
 *       currencyCode: "USD",
 *       totalPriceStatus: "FINAL",
 *       totalPrice: "100.00",
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
 *   if (isPending || !googlePayConfig) return null;
 *   if (error) return <div>Error: {error.message}</div>;
 *
 *   return <button onClick={handleClick}>Pay with Google Pay</button>;
 * }
 * ```
 */
export function useGooglePayOneTimePaymentSession({
  googlePayConfig,
  transactionInfo,
  environment = "TEST",
  createOrder,
  ...callbacks
}: UseGooglePayOneTimePaymentSessionProps): UseGooglePayOneTimePaymentSessionReturn {
  const { sdkInstance, loadingStatus } = usePayPal();
  const isMountedRef = useIsMountedRef();
  const sessionRef = useRef<GooglePayOneTimePaymentSession | null>(null);
  const paymentsClientRef = useRef<google.payments.api.PaymentsClient | null>(
    null,
  );
  const createOrderRef = useRef(createOrder);
  createOrderRef.current = createOrder;
  const proxyCallbacks = useProxyProps(callbacks);
  const [error, setError] = useError();
  const [paymentsClient, setPaymentsClient] =
    useState<google.payments.api.PaymentsClient | null>(null);
  const [formattedConfig, setFormattedConfig] =
    useState<GooglePayConfig | null>(null);

  // Prevents retrying session creation with a failed SDK instance
  const failedSdkRef = useRef<unknown>(null);

  const isPending = loadingStatus === INSTANCE_LOADING_STATE.PENDING;

  const handleCancel = useCallback(() => {
    // Google Pay doesn't have a persistent session to cancel;
    // the payment sheet is managed by Google's PaymentsClient.
  }, []);

  const handleDestroy = useCallback(() => {
    sessionRef.current = null;
    paymentsClientRef.current = null;
    setPaymentsClient(null);
    setFormattedConfig(null);
  }, []);

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
      sessionCreator: () => sdkInstance.createGooglePayOneTimePaymentSession(),
      failedSdkRef,
      sdkInstance,
      setError,
      errorMessage:
        'Failed to create payment session. This may occur if the required component "googlepay-payments" is not included in the SDK components array.',
    });

    if (!newSession) {
      return;
    }

    sessionRef.current = newSession;

    return () => {
      sessionRef.current = null;
    };
  }, [sdkInstance, setError]);

  // Create a reusable PaymentsClient and formatted config so the component can
  // run isReadyToPay and mount the native Google Pay button before user click.
  useEffect(() => {
    if (!sessionRef.current) {
      paymentsClientRef.current = null;
      setPaymentsClient(null);
      setFormattedConfig(null);
      return;
    }

    if (
      typeof window === "undefined" ||
      !window.google?.payments?.api?.PaymentsClient
    ) {
      paymentsClientRef.current = null;
      setPaymentsClient(null);
      setFormattedConfig(null);

      // This effect only runs in the browser (React skips effects during SSR),
      // so reaching here means pay.js has not loaded yet. Fail loudly instead of
      // silently rendering an empty button container.
      const sdkNotLoadedError = new Error(
        "Google Pay JS SDK (pay.js) is not loaded. Add " +
          '<script src="https://pay.google.com/gp/p/js/pay.js"></script> ' +
          "to your HTML before <GooglePayOneTimePaymentButton> mounts.",
      );
      setError(sdkNotLoadedError);
      proxyCallbacks.onError?.(sdkNotLoadedError);
      return;
    }

    try {
      const paypalSession = sessionRef.current;
      const nextFormattedConfig =
        paypalSession.formatConfigForPaymentRequest(googlePayConfig);

      const nextPaymentsClient = new window.google.payments.api.PaymentsClient({
        environment,
        paymentDataCallbacks: {
          onPaymentAuthorized: async (
            paymentData: google.payments.api.PaymentData,
          ) => {
            try {
              const order = await createOrderRef.current();

              const confirmResult = await paypalSession.confirmOrder({
                orderId: order.orderId,
                paymentMethodData:
                  paymentData.paymentMethodData as unknown as GooglePayPaymentMethodData,
              });

              // Handle 3DS (3-D Secure) authentication if required
              // When confirmOrder returns PAYER_ACTION_REQUIRED status, initiate payer action
              if (confirmResult.status === "PAYER_ACTION_REQUIRED") {
                paypalSession.initiatePayerAction();
              }

              await proxyCallbacks.onApprove(confirmResult);

              return { transactionState: "SUCCESS" as const };
            } catch (err) {
              const paymentError = toError(err);
              setError(paymentError);
              proxyCallbacks.onError?.(paymentError);

              return {
                transactionState: "ERROR" as const,
                error: {
                  intent: "PAYMENT_AUTHORIZATION",
                  message: paymentError.message,
                  reason: "OTHER_ERROR",
                },
              };
            }
          },
        },
      });

      paymentsClientRef.current = nextPaymentsClient;
      setPaymentsClient(nextPaymentsClient);
      setFormattedConfig(nextFormattedConfig);
    } catch (err) {
      paymentsClientRef.current = null;
      setPaymentsClient(null);
      setFormattedConfig(null);
      const setupError = toError(err);
      setError(setupError);
      proxyCallbacks.onError?.(setupError);
    }
  }, [googlePayConfig, environment, proxyCallbacks, sdkInstance, setError]);

  const createGooglePayButton = useCallback(
    async (options: GooglePayButtonOptions): Promise<HTMLElement | null> => {
      if (!paymentsClientRef.current || !formattedConfig) {
        return null;
      }

      try {
        const isReadyToPay = await paymentsClientRef.current.isReadyToPay({
          allowedPaymentMethods: formattedConfig.allowedPaymentMethods,
          apiVersion: formattedConfig.apiVersion,
          apiVersionMinor: formattedConfig.apiVersionMinor,
        });

        if (!isReadyToPay.result) {
          return null;
        }

        return paymentsClientRef.current.createButton(options);
      } catch (err) {
        const setupError = toError(err);
        setError(setupError);
        proxyCallbacks.onError?.(setupError);
        return null;
      }
    },
    [formattedConfig, proxyCallbacks, setError],
  );

  const handleClick = useCallback(async () => {
    if (!isMountedRef.current) {
      return;
    }

    // Clear any error from a previous attempt so the user can retry
    setError(null);

    if (!sessionRef.current) {
      setError(new Error("Google Pay session not available"));
      return;
    }

    if (!paymentsClientRef.current || !formattedConfig) {
      setError(new Error("Google Pay client is not available"));
      return;
    }

    try {
      const paymentDataRequest = {
        apiVersion: formattedConfig.apiVersion,
        apiVersionMinor: formattedConfig.apiVersionMinor,
        allowedPaymentMethods: formattedConfig.allowedPaymentMethods,
        merchantInfo: formattedConfig.merchantInfo,
        transactionInfo,
        callbackIntents: ["PAYMENT_AUTHORIZATION"] as const,
      };

      await paymentsClientRef.current.loadPaymentData(paymentDataRequest);
    } catch (err) {
      if ((err as { statusCode?: string })?.statusCode === "CANCELED") {
        proxyCallbacks.onCancel?.();
        return;
      }
      // Authorization errors are already reported in onPaymentAuthorized.
      // Other rejections (e.g. DEVELOPER_ERROR) are configuration issues
      // that surface during development, not runtime payment failures.
    }
  }, [
    isMountedRef,
    transactionInfo,
    formattedConfig,
    proxyCallbacks,
    setError,
  ]);

  return {
    error,
    isPending,
    paymentsClient,
    formattedConfig,
    createGooglePayButton,
    handleClick,
    handleCancel,
    handleDestroy,
  };
}
