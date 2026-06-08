import { useContext, Dispatch } from "react";

import { BraintreeDispatchContext } from "../../context/BraintreeDispatchContext";

import type { BraintreeAction } from "../../context/BraintreePayPalContext";

/**
 * Internal hook for dispatching Braintree PayPal state updates.
 *
 * @remarks
 * This is an INTERNAL API and should not be used directly by external consumers.
 * Only use this in internal hooks that need to update the Braintree PayPal
 * context state.
 *
 * @internal
 *
 * @returns Dispatch function for Braintree PayPal actions
 */
export function useBraintreePayPalDispatch(): Dispatch<BraintreeAction> {
  const dispatch = useContext(BraintreeDispatchContext);

  if (dispatch === null) {
    throw new Error(
      "useBraintreePayPalDispatch must be used within a BraintreePayPalProvider",
    );
  }

  return dispatch;
}
