import { action } from "storybook/actions";
import { dispatchPaymentResult } from "../PaymentResult";

import type { BraintreeOnCancelData } from "@paypal/react-paypal-js/sdk-v6";

export const BRAINTREE_SAMPLE_INTEGRATION_API =
  import.meta.env.STORYBOOK_BRAINTREE_API_URL ||
  "https://v6-web-sdk-with-braintree-sdk-sample-integration.fly.dev";

export async function getBraintreeClientToken(): Promise<string> {
  const response = await fetch(
    `${BRAINTREE_SAMPLE_INTEGRATION_API}/braintree-api/auth/browser-safe-client-token`,
  );

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `Failed to fetch Braintree client token: ${response.status} ${response.statusText}${errorBody ? ` - ${errorBody}` : ""}`,
    );
  }

  const { clientToken } = await response.json();
  return clientToken;
}

// Three settlement helpers — one per button. The mapping is the Challenge 3
// footgun: BraintreeApprovalData is the same type across all three buttons,
// but the right server endpoint is determined by which button produced the nonce.

/** Used by BraintreePayPalOneTimePaymentButton — charges once, no vault. */
export async function braintreeTransactionSale(
  paymentMethodNonce: string,
  amount: string,
): Promise<unknown> {
  const response = await fetch(
    `${BRAINTREE_SAMPLE_INTEGRATION_API}/braintree-api/transaction/sale`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paymentMethodNonce, amount }),
    },
  );

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `Failed Braintree transaction sale: ${response.status} ${response.statusText}${errorBody ? ` - ${errorBody}` : ""}`,
    );
  }

  return response.json();
}

/** Used by BraintreePayPalCheckoutWithVaultButton — charges once and vaults. */
export async function braintreeTransactionSaleWithVault(
  paymentMethodNonce: string,
  amount: string,
): Promise<unknown> {
  const response = await fetch(
    `${BRAINTREE_SAMPLE_INTEGRATION_API}/braintree-api/transaction/sale`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        paymentMethodNonce,
        amount,
        options: { storeInVaultOnSuccess: true },
      }),
    },
  );

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `Failed Braintree transaction sale with vault: ${response.status} ${response.statusText}${errorBody ? ` - ${errorBody}` : ""}`,
    );
  }

  return response.json();
}

/** Used by BraintreePayPalBillingAgreementButton — vaults without charging. */
export async function braintreeVaultPaymentMethod(
  paymentMethodNonce: string,
): Promise<unknown> {
  const response = await fetch(
    `${BRAINTREE_SAMPLE_INTEGRATION_API}/braintree-api/payment-method/save`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paymentMethodNonce }),
    },
  );

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `Failed Braintree vault payment method: ${response.status} ${response.statusText}${errorBody ? ` - ${errorBody}` : ""}`,
    );
  }

  return response.json();
}

// onApprove cannot live at module scope — it needs braintreePayPalCheckoutInstance
// from useBraintreePayPal(). Each story defines onApprove inline in its wrapper.

// data is optional because BraintreeCheckoutWithVaultSessionOptions.onCancel
// is typed as `() => void` (no args), while the other two flows pass data.
// Optional parameter lets one handler satisfy both signatures.
export const braintreeSharedCancelHandler = (data?: BraintreeOnCancelData) => {
  action("cancel")(data);
  dispatchPaymentResult(
    "cancel",
    "Braintree payment was cancelled by the buyer.",
  );
};

export const braintreeSharedErrorHandler = (error: Error) => {
  action("error")(error);
  dispatchPaymentResult(
    "error",
    `Braintree payment error: ${error?.message ?? "Unknown error"}`,
  );
};
