import { useContext, Dispatch } from "react";

import { PayPalDispatchContext } from "../context/PayPalDispatchContext";

import type { InstanceAction } from "../context/PayPalProviderContext";

/**
 * Internal hook for dispatching PayPal state updates.
 *
 * @remarks
 * This is an INTERNAL API and should not be used directly by external consumers.
 * Only use this in internal hooks that need to update the PayPal context state.
 *
 * @internal
 *
 * @returns Dispatch function for PayPal instance actions
 */
export function usePayPalDispatch(): Dispatch<InstanceAction> {
    const dispatch = useContext(PayPalDispatchContext);

    if (dispatch === null) {
        throw new Error(
            "usePayPalDispatch must be used within a PayPalProvider",
        );
    }

    return dispatch;
}
