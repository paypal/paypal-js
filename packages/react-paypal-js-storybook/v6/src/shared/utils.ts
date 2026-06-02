/**
 * Shared utilities for V6 Storybook stories.
 *
 * Single Source of Truth for:
 * - Sample integration server URL
 * - Order creation/capture functions
 * - Vault token creation functions
 * - Shared callbacks for one-time and save payments
 * - Shared argTypes definitions
 */

import type {
  OnApproveDataOneTimePayments,
  OnApproveDataSubscriptions,
  OnCancelDataOneTimePayments,
  OnCancelDataSavePayments,
  OnErrorData,
  ConfirmOrderResponse,
  GooglePayApprovePaymentResponse,
} from "@paypal/react-paypal-js/sdk-v6";
import { action } from "storybook/actions";
import { dispatchPaymentResult } from "./PaymentResult";

export const SAMPLE_INTEGRATION_API =
  import.meta.env.STORYBOOK_PAYPAL_API_URL ||
  "https://v6-web-sdk-sample-integration-server.fly.dev";

export const PAYPAL_CLIENT_ID =
  import.meta.env.STORYBOOK_PAYPAL_SANDBOX_CLIENT_ID || "";

// One-Time Payment APIs

export async function createOrder(): Promise<{ orderId: string }> {
  const response = await fetch(
    `${SAMPLE_INTEGRATION_API}/paypal-api/checkout/orders/create-order-for-one-time-payment`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    },
  );
  const data = await response.json();
  return { orderId: data.id };
}

export async function captureOrder(
  orderId: string,
): Promise<Record<string, unknown>> {
  const response = await fetch(
    `${SAMPLE_INTEGRATION_API}/paypal-api/checkout/orders/${orderId}/capture`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    },
  );
  return response.json();
}

// Vault/Save Payment APIs

export async function createVaultToken(): Promise<{ vaultSetupToken: string }> {
  const response = await fetch(
    `${SAMPLE_INTEGRATION_API}/paypal-api/vault/create-setup-token-for-paypal-save-payment`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    },
  );
  const data = await response.json();
  return { vaultSetupToken: data.id };
}

// Subscription APIs

export async function createSubscription(): Promise<{
  subscriptionId: string;
}> {
  const response = await fetch(
    `${SAMPLE_INTEGRATION_API}/paypal-api/billing/create-subscription`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    },
  );
  const data = await response.json();
  return { subscriptionId: data.id };
}

// Shared Callbacks
// Note: onError is typed as 'unknown' to avoid intersection conflict between
// PayPalError and HTMLButtonElement's onError (ReactEventHandler) in the component props

export const oneTimePaymentCallbacks = {
  onApprove: async (data: OnApproveDataOneTimePayments) => {
    const orderData = await captureOrder(data.orderId);
    action("approve")({
      ...orderData,
      orderID: data.orderId,
    });
    dispatchPaymentResult(
      "success",
      `Payment captured successfully. Order ID: ${data.orderId}`,
    );
  },
  onCancel: (data: OnCancelDataOneTimePayments) => {
    action("cancel")(data);
    dispatchPaymentResult("cancel", "Payment was cancelled by the buyer.");
  },
  onError: (error: unknown) => {
    action("error")(error as OnErrorData);
    dispatchPaymentResult(
      "error",
      `Payment error: ${(error as OnErrorData)?.message || "Unknown error"}`,
    );
  },
};

export const savePaymentCallbacks = {
  onApprove: async (data: { vaultSetupToken: string }) => {
    action("approve")(data);
    dispatchPaymentResult(
      "success",
      `Payment method saved successfully. Token: ${data.vaultSetupToken}`,
    );
  },
  onCancel: (data: OnCancelDataSavePayments) => {
    action("cancel")(data);
    dispatchPaymentResult("cancel", "Save payment was cancelled by the buyer.");
  },
  onError: (error: unknown) => {
    action("error")(error as OnErrorData);
    dispatchPaymentResult(
      "error",
      `Save payment error: ${(error as OnErrorData)?.message || "Unknown error"}`,
    );
  },
};

export const subscriptionCallbacks = {
  onApprove: async (data: OnApproveDataSubscriptions) => {
    action("approve")({
      subscriptionId: data.subscriptionId,
      payerId: data.payerId,
    });
    dispatchPaymentResult(
      "success",
      `Subscription approved. ID: ${data.subscriptionId}`,
    );
  },
  onCancel: (data: OnCancelDataOneTimePayments) => {
    action("cancel")(data);
    dispatchPaymentResult("cancel", "Subscription was cancelled by the buyer.");
  },
  onError: (error: unknown) => {
    action("error")(error as OnErrorData);
    dispatchPaymentResult(
      "error",
      `Subscription error: ${(error as OnErrorData)?.message || "Unknown error"}`,
    );
  },
};

// Shared ArgTypes

export const BUTTON_TYPES = [
  "pay",
  "checkout",
  "buynow",
  "subscribe",
  "donate",
] as const;

export const buttonTypeArgType = {
  control: { type: "select" as const },
  options: BUTTON_TYPES,
  description: "Button label type",
};

export const presentationModeArgType = {
  control: { type: "select" as const },
  options: ["auto", "popup", "modal", "redirect"],
  description: "How the checkout flow is presented",
};

export const venmoPresentationModeArgType = {
  control: { type: "select" as const },
  options: ["auto", "popup", "modal"],
  description: "Venmo presentation mode (auto, popup, or modal only)",
};

export const disabledArgType = {
  control: { type: "boolean" as const },
  description: "Disable the button",
};

// Apple Pay Callbacks

export const applePayCallbacks = {
  onApprove: async (data: ConfirmOrderResponse) => {
    const orderId = data.approveApplePayPayment.id;
    const orderData = await captureOrder(orderId);
    action("approve")({ ...orderData, orderID: orderId });
    dispatchPaymentResult(
      "success",
      `Apple Pay payment captured. Order ID: ${orderId}`,
    );
  },
  onCancel: () => {
    action("cancel")("Apple Pay cancelled");
    dispatchPaymentResult(
      "cancel",
      "Apple Pay payment was cancelled by the buyer.",
    );
  },
  onError: (error: Error) => {
    action("error")(error);
    dispatchPaymentResult(
      "error",
      `Apple Pay error: ${error.message || "Unknown error"}`,
    );
  },
};

// Braintree Callbacks

export const braintreeOneTimePaymentCallbacks = {
  onApprove: async (data: { payerId?: string; orderId?: string }) => {
    action("approve")(data);
    dispatchPaymentResult(
      "success",
      `Braintree payment approved. Order ID: ${data.orderId || "N/A"}`,
    );
  },
  onCancel: (data: { orderId?: string }) => {
    action("cancel")(data);
    dispatchPaymentResult(
      "cancel",
      "Braintree payment was cancelled by the buyer.",
    );
  },
  onError: (error: unknown) => {
    action("error")(error);
    dispatchPaymentResult(
      "error",
      `Braintree error: ${(error as Error)?.message || "Unknown error"}`,
    );
  },
};

// Braintree ArgTypes

export const braintreeIntentArgType = {
  control: { type: "select" as const },
  options: ["authorize", "capture", "order"],
  description: "Payment intent for the Braintree transaction",
};

// Apple Pay ArgTypes

export const APPLE_PAY_BUTTON_STYLES = [
  "black",
  "white",
  "white-outline",
] as const;

export const APPLE_PAY_BUTTON_TYPES = [
  "pay",
  "buy",
  "set-up",
  "donate",
  "check-out",
  "book",
  "subscribe",
] as const;

export const applePayButtonStyleArgType = {
  control: { type: "select" as const },
  options: APPLE_PAY_BUTTON_STYLES,
  description: "Apple Pay button visual style",
};

export const applePayButtonTypeArgType = {
  control: { type: "select" as const },
  options: APPLE_PAY_BUTTON_TYPES,
  description: "Apple Pay button label type",
};

// Google Pay Callbacks

export const googlePayCallbacks = {
  onApprove: async (data: GooglePayApprovePaymentResponse) => {
    const orderId = data.id;
    const orderData = await captureOrder(orderId);
    action("approve")({ ...orderData, orderID: orderId });
    dispatchPaymentResult(
      "success",
      `Google Pay payment captured. Order ID: ${orderId}`,
    );
  },
  onCancel: () => {
    action("cancel")("Google Pay cancelled");
    dispatchPaymentResult(
      "cancel",
      "Google Pay payment was cancelled by the buyer.",
    );
  },
  onError: (error: Error) => {
    action("error")(error);
    dispatchPaymentResult(
      "error",
      `Google Pay error: ${error.message || "Unknown error"}`,
    );
  },
};

// Google Pay ArgTypes

export const GOOGLE_PAY_BUTTON_TYPES = [
  "pay",
  "buy",
  "checkout",
  "donate",
  "order",
  "plain",
  "subscribe",
  "book",
] as const;

export const GOOGLE_PAY_BUTTON_COLORS = ["default", "black", "white"] as const;

export const GOOGLE_PAY_BUTTON_SIZE_MODES = ["fill", "static"] as const;

export const googlePayButtonTypeArgType = {
  control: { type: "select" as const },
  options: GOOGLE_PAY_BUTTON_TYPES,
  description: "Google Pay button label type",
};

export const googlePayButtonColorArgType = {
  control: { type: "select" as const },
  options: GOOGLE_PAY_BUTTON_COLORS,
  description: "Google Pay button color theme",
};

export const googlePayButtonSizeModeArgType = {
  control: { type: "select" as const },
  options: GOOGLE_PAY_BUTTON_SIZE_MODES,
  description: "Google Pay button sizing mode (fill container or static size)",
};
