/**
 * Shared utilities for LPM (Local Payment Method) stories.
 */

import type { OnApproveDataOneTimePayments, OnCancelDataOneTimePayments, OnErrorData } from "@paypal/react-paypal-js/sdk-v6";
import { action } from "storybook/actions";
import { captureOrder } from "../utils";
import { dispatchPaymentResult } from "../PaymentResult";

// ─── Session field arg types (Storybook controls) ────────────────────────────

export const phoneArgTypes = {
  phoneCountryCode: {
    control: { type: "text" as const },
    description: "Phone country code (e.g. \"1\" for US, \"351\" for Portugal)",
    defaultValue: "1",
    table: { category: "Session Fields" },
  },
  phoneNationalNumber: {
    control: { type: "text" as const },
    description: "Phone national number without country code",
    defaultValue: "4155552671",
    table: { category: "Session Fields" },
  },
};

export const billingAddressArgTypes = {
  billingAddressLine1: {
    control: { type: "text" as const },
    description: "Billing address line 1",
    defaultValue: "123 Main St",
    table: { category: "Session Fields" },
  },
  billingAddressLine2: {
    control: { type: "text" as const },
    description: "Billing address line 2 (optional)",
    table: { category: "Session Fields" },
  },
  billingAdminArea1: {
    control: { type: "text" as const },
    description: "State / province",
    defaultValue: "CA",
    table: { category: "Session Fields" },
  },
  billingAdminArea2: {
    control: { type: "text" as const },
    description: "City",
    defaultValue: "San Jose",
    table: { category: "Session Fields" },
  },
  billingPostalCode: {
    control: { type: "text" as const },
    description: "Postal / ZIP code",
    defaultValue: "95131",
    table: { category: "Session Fields" },
  },
  billingCountryCode: {
    control: { type: "text" as const },
    description: "Two-letter ISO 3166 country code",
    defaultValue: "US",
    table: { category: "Session Fields" },
  },
};

export const taxInfoArgTypes = {
  taxId: {
    control: { type: "text" as const },
    description: "Tax ID (CPF / CNPJ or equivalent)",
    defaultValue: "12345678901",
    table: { category: "Session Fields" },
  },
  taxIdType: {
    control: { type: "select" as const },
    options: ["BR_CPF", "BR_CNPJ"],
    description: "Tax ID type",
    defaultValue: "BR_CPF",
    table: { category: "Session Fields" },
  },
};

export const floaArgTypes = {
  dateOfBirth: {
    control: { type: "text" as const },
    description: "Date of birth in ISO 8601 format (YYYY-MM-DD)",
    defaultValue: "1990-01-15",
    table: { category: "Session Fields" },
  },
  numberOfInstallments: {
    control: { type: "number" as const },
    description: "Number of installments (e.g. 3, 6, 12)",
    defaultValue: 3,
    table: { category: "Session Fields" },
  },
};

export const presentationModeArgType = {
  control: { type: "select" as const },
  options: ["auto", "popup"],
  description: "How the payment flow is presented (auto redirects on mobile, popup otherwise)",
};

export const disabledArgType = {
  control: { type: "boolean" as const },
  description: "Disable the button",
};

// ─── Shared LPM callbacks ────────────────────────────────────────────────────

export const lpmCallbacks = {
  onApprove: async (data: OnApproveDataOneTimePayments) => {
    const orderData = await captureOrder(data.orderId);
    action("approve")({ ...orderData, orderID: data.orderId });
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

// ─── Default arg values for session fields ───────────────────────────────────

export const defaultPhoneArgs = {
  phoneCountryCode: "1",
  phoneNationalNumber: "4155552671",
};

export const defaultBillingAddressArgs = {
  billingAddressLine1: "123 Main St",
  billingAddressLine2: "",
  billingAdminArea1: "CA",
  billingAdminArea2: "San Jose",
  billingPostalCode: "95131",
  billingCountryCode: "US",
};

export const defaultTaxInfoArgs = {
  taxId: "12345678901",
  taxIdType: "BR_CPF",
};

export const defaultFloaArgs = {
  dateOfBirth: "1990-01-15",
  numberOfInstallments: 3,
};

// ─── Helpers to reconstruct structured session field values from flat args ───

export function buildPhone(
  countryCode: string,
  nationalNumber: string,
): { countryCode: string; nationalNumber: string } {
  return { countryCode, nationalNumber };
}

export function buildBillingAddress(args: {
  billingAddressLine1: string;
  billingAddressLine2?: string;
  billingAdminArea1: string;
  billingAdminArea2: string;
  billingPostalCode: string;
  billingCountryCode: string;
}) {
  return {
    addressLine1: args.billingAddressLine1,
    ...(args.billingAddressLine2 ? { addressLine2: args.billingAddressLine2 } : {}),
    adminArea1: args.billingAdminArea1,
    adminArea2: args.billingAdminArea2,
    postalCode: args.billingPostalCode,
    countryCode: args.billingCountryCode,
  };
}

export function buildTaxInfo(taxId: string, taxIdType: string) {
  return { taxId, taxIdType };
}
