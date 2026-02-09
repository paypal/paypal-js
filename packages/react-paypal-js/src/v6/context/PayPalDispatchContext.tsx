import { createContext, Dispatch } from "react";

import type { InstanceAction } from "./PayPalProviderContext";

/**
 * Internal context for dispatching PayPal instance state updates.
 * This is NOT exported to external consumers.
 * Only hooks like useEligibleMethods can access this internally.
 *
 * @internal
 */
export const PayPalDispatchContext =
    createContext<Dispatch<InstanceAction> | null>(null);
