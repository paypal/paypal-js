import { createContext, Dispatch } from "react";

import type { BraintreeAction } from "./BraintreePayPalContext";

/**
 * Internal context for dispatching Braintree PayPal state updates.
 * This is NOT exported to external consumers.
 * Only hooks like useBraintreeEligibleMethods can access this internally.
 *
 * @internal
 */
export const BraintreeDispatchContext =
  createContext<Dispatch<BraintreeAction> | null>(null);
