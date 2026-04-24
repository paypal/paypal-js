import { useContext } from "react";

import { BraintreePayPalContext } from "../../context/BraintreePayPalContext";

import type { BraintreePayPalState } from "../../context/BraintreePayPalContext";
import type { BraintreePayPalProvider } from "../../components/Braintree/BraintreePayPalProvider";

/**
 * Returns {@link BraintreePayPalState} provided by a parent {@link BraintreePayPalProvider}.
 *
 * @returns {BraintreePayPalState}
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
