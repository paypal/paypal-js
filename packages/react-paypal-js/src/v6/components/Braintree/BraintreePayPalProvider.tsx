import React, { useEffect, useMemo, useReducer, useState } from "react";

import {
    BraintreePayPalContext,
    braintreeInitialState,
    braintreeReducer,
    BRAINTREE_DISPATCH_ACTION,
} from "../../context/BraintreePayPalContext";
import { INSTANCE_LOADING_STATE } from "../../types/PayPalProviderEnums";
import { toError } from "../../utils";
import { useError } from "../../hooks/useError";
import { useIsomorphicLayoutEffect } from "../../hooks/useIsomorphicLayoutEffect";
import { validateBraintreeNamespace } from "../../types/braintree";

import type { BraintreeV6Namespace } from "../../types";
import type { BraintreePayPalState } from "../../context/BraintreePayPalContext";
import type { useBraintreePayPal } from "../../hooks/useBraintreePayPal";

interface BraintreePayPalProviderProps {
    namespace: BraintreeV6Namespace;
    braintreeClientToken: string | undefined;
}

/**
 * {@link BraintreePayPalProvider} validates the Braintree namespace, creates a Braintree client
 * and PayPal Checkout V6 instance, loads the PayPal SDK, then provides the checkout instance
 * in context to child components via the {@link useBraintreePayPal} hook.
 *
 * The merchant is responsible for loading the Braintree client and paypal-checkout-v6 scripts
 * before rendering this provider.
 *
 * **Important:** The `namespace` prop must have referential stability across renders.
 * An unstable reference (e.g., creating the object inline) will cause re-initialization
 * on every render. Use a module-level constant, `useRef`, or `useMemo`.
 *
 * @example
 * // Merchant loads scripts in their HTML:
 * // <script src="https://www.paypalobjects.com/braintree/web/3.139.0/js/client.min.js"></script>
 * // <script src="https://js.braintreegateway.com/web/3.139.0/js/paypal-checkout-v6.min.js"></script>
 *
 * <BraintreePayPalProvider
 *   namespace={window.braintree}
 *   braintreeClientToken={clientToken}
 * >
 *   <BraintreeCheckout />
 * </BraintreePayPalProvider>
 *
 * @example
 * // Inside a child component:
 * function BraintreeCheckout() {
 *   const { braintreePayPalCheckoutInstance, loadingStatus } = useBraintreePayPal();
 *
 *   // Use braintreePayPalCheckoutInstance to create payment sessions
 *   // and call tokenizePayment in onApprove callbacks
 * }
 */
export const BraintreePayPalProvider: React.FC<
    BraintreePayPalProviderProps
> = ({ namespace, braintreeClientToken, children }) => {
    const [state, dispatch] = useReducer(
        braintreeReducer,
        braintreeInitialState,
    );
    const [isHydrated, setIsHydrated] = useState(false);
    const [, setError] = useError();

    // Set hydrated state after initial client render to prevent hydration mismatch
    useIsomorphicLayoutEffect(() => {
        setIsHydrated(true);
    }, []);

    useEffect(() => {
        if (!validateBraintreeNamespace(namespace)) {
            const validationError = new Error(
                "Invalid Braintree namespace. Ensure the Braintree client and " +
                    "paypal-checkout-v6 scripts are loaded and that " +
                    "namespace.client.create and namespace.paypalCheckoutV6.create are functions.",
            );
            setError(validationError);
            dispatch({
                type: BRAINTREE_DISPATCH_ACTION.SET_ERROR,
                value: validationError,
            });
            return;
        }

        let isSubscribed = true;

        dispatch({
            type: BRAINTREE_DISPATCH_ACTION.SET_LOADING_STATUS,
            value: INSTANCE_LOADING_STATE.PENDING,
        });

        const initialize = async () => {
            if (!braintreeClientToken) {
                const clientTokenError = new Error(
                    "Braintree client token is required to initialize the PayPal Checkout instance.",
                );
                if (isSubscribed) {
                    setError(clientTokenError);
                    dispatch({
                        type: BRAINTREE_DISPATCH_ACTION.SET_ERROR,
                        value: clientTokenError,
                    });
                }
                return;
            }

            try {
                const clientInstance = await namespace.client.create({
                    authorization: braintreeClientToken,
                });

                if (!isSubscribed) {
                    return;
                }

                const paypalCheckoutInstance =
                    await namespace.paypalCheckoutV6.create({
                        client: clientInstance,
                    });

                if (!isSubscribed) {
                    return;
                }

                await paypalCheckoutInstance.loadPayPalSDK();

                if (!isSubscribed) {
                    return;
                }

                dispatch({
                    type: BRAINTREE_DISPATCH_ACTION.SET_INSTANCE,
                    value: paypalCheckoutInstance,
                });
            } catch (error) {
                if (isSubscribed) {
                    setError(error);
                    dispatch({
                        type: BRAINTREE_DISPATCH_ACTION.SET_ERROR,
                        value: toError(error),
                    });
                }
            }
        };

        initialize();

        return () => {
            isSubscribed = false;
        };
    }, [namespace, braintreeClientToken, setError]);

    const contextValue: BraintreePayPalState = useMemo(
        () => ({
            braintreePayPalCheckoutInstance:
                state.braintreePayPalCheckoutInstance,
            loadingStatus: state.loadingStatus,
            error: state.error,
            isHydrated,
        }),
        [
            state.braintreePayPalCheckoutInstance,
            state.loadingStatus,
            state.error,
            isHydrated,
        ],
    );

    return (
        <BraintreePayPalContext.Provider value={contextValue}>
            {children}
        </BraintreePayPalContext.Provider>
    );
};
