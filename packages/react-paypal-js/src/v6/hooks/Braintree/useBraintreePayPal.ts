import { useContext } from "react";

import { BraintreePayPalContext } from "../../context/BraintreePayPalContext";

import type { BraintreePayPalState } from "../../context/BraintreePayPalContext";
import type { BraintreePayPalProvider } from "../../components/Braintree/BraintreePayPalProvider";

/**
 * Returns the {@link BraintreePayPalState} provided by a parent {@link BraintreePayPalProvider}.
 *
 * The returned state includes:
 * - `braintreePayPalCheckoutInstance` — the Braintree PayPal Checkout V6 instance
 *   used for `tokenizePayment()`, `findEligibleMethods()`, and `updatePayment()`
 * - `loadingStatus` — `"pending"`, `"resolved"`, or `"rejected"`
 * - `error` — any initialization error
 * - `isHydrated` — `false` during SSR, `true` after client hydration
 *
 * Must be used within a `BraintreePayPalProvider`.
 *
 * @returns {BraintreePayPalState}
 *
 * @example
 * function CheckoutButtons() {
 *   const { braintreePayPalCheckoutInstance, loadingStatus } = useBraintreePayPal();
 *
 *   const handleOnApprove = async (data) => {
 *     const { nonce } = await braintreePayPalCheckoutInstance.tokenizePayment({
 *       orderID: data.orderId,
 *       payerID: data.payerId,
 *     });
 *     // Send nonce to your server to complete the transaction
 *   };
 *
 *   if (loadingStatus !== "resolved") return <div>Loading...</div>;
 *
 *   return (
 *     <BraintreePayPalOneTimePaymentButton
 *       amount="100"
 *       currency="USD"
 *       onApprove={handleOnApprove}
 *     />
 *   );
 * }
 */
export function useBraintreePayPal(): BraintreePayPalState {
  const context = useContext(BraintreePayPalContext);

  if (context === null) {
    throw new Error(
      "useBraintreePayPal must be used within a BraintreePayPalProvider",
    );
  }

  return context;
}
