import type {
  GooglePayConfig,
  GooglePayPaymentMethodData,
} from "@paypal/paypal-js/sdk-v6";

export interface GooglePayTransactionInfo {
  countryCode: string;
  currencyCode: string;
  totalPriceStatus: "FINAL" | "ESTIMATED" | "NOT_CURRENTLY_KNOWN";
  totalPrice: string;
  totalPriceLabel?: string;
  displayItems?: Array<{
    label: string;
    type: string;
    price: string;
  }>;
  [key: string]: unknown;
}

export interface GooglePayIsReadyToPayRequest {
  allowedPaymentMethods: GooglePayConfig["allowedPaymentMethods"];
  apiVersion: GooglePayConfig["apiVersion"];
  apiVersionMinor: GooglePayConfig["apiVersionMinor"];
}

export interface GooglePayPaymentDataRequest extends GooglePayIsReadyToPayRequest {
  merchantInfo: GooglePayConfig["merchantInfo"];
  transactionInfo: GooglePayTransactionInfo;
  callbackIntents: ReadonlyArray<"PAYMENT_AUTHORIZATION">;
}

export interface GooglePayButtonOptions {
  onClick: () => void;
  buttonType?:
    | "book"
    | "buy"
    | "checkout"
    | "donate"
    | "order"
    | "pay"
    | "plain"
    | "subscribe";
  buttonColor?: "default" | "black" | "white";
  buttonSizeMode?: "static" | "fill";
  buttonLocale?: string;
}

declare global {
  interface Window {
    google?: {
      payments: {
        api: {
          PaymentsClient: new (config: {
            environment: string;
            paymentDataCallbacks?: {
              onPaymentAuthorized?: (
                paymentData: google.payments.api.PaymentData,
              ) => Promise<google.payments.api.PaymentAuthorizationResult>;
            };
          }) => google.payments.api.PaymentsClient;
        };
      };
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace google.payments.api {
    interface PaymentData {
      paymentMethodData: GooglePayPaymentMethodData;
    }

    interface PaymentAuthorizationResult {
      transactionState: "SUCCESS" | "ERROR";
      error?: {
        intent: string;
        message: string;
        reason: string;
      };
    }

    interface PaymentsClient {
      loadPaymentData(request: GooglePayPaymentDataRequest): Promise<void>;
      isReadyToPay(
        request: GooglePayIsReadyToPayRequest,
      ): Promise<{ result: boolean }>;
      createButton(options: GooglePayButtonOptions): HTMLElement;
    }
  }
}
