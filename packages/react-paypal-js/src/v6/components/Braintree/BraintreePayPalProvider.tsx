import React, { useEffect, useMemo, useReducer, useState } from "react";

import {
  BraintreePayPalContext,
  braintreeInitialState,
  braintreeReducer,
} from "../../context/BraintreePayPalContext";
import { BraintreeDispatchContext } from "../../context/BraintreeDispatchContext";
import {
  BRAINTREE_DISPATCH_ACTION,
  INSTANCE_LOADING_STATE,
} from "../../types/ProviderEnums";
import { toError } from "../../utils";
import { useError } from "../../hooks/useError";
import { useIsomorphicLayoutEffect } from "../../hooks/useIsomorphicLayoutEffect";
import { validateBraintreeNamespace } from "../../types/braintree";

import type {
  BraintreeV6Namespace,
  BraintreePayPalCheckoutInstance,
} from "../../types";
import type { BraintreePayPalState } from "../../context/BraintreePayPalContext";

interface BraintreePayPalProviderProps {
  namespace: BraintreeV6Namespace;
  braintreeClientToken: string | undefined;
  children: React.ReactNode;
}

/**
 * {@link BraintreePayPalProvider} validates the Braintree namespace, creates a Braintree client
 * and PayPal Checkout V6 instance, loads the PayPal SDK, then provides the checkout instance
 * in context to child components via the `useBraintreePayPal` hook.
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
 * function App() {
 *   const [clientToken, setClientToken] = useState<string | undefined>(undefined);
 *
 *   useEffect(() => {
 *     fetch("/auth/browser-safe-client-token")
 *       .then((res) => res.json())
 *       .then(({ clientToken }) => setClientToken(clientToken));
 *   }, []);
 *
 *   if (!clientToken) return <div>Loading...</div>;
 *
 *   return (
 *     <BraintreePayPalProvider
 *       namespace={window.braintree}
 *       braintreeClientToken={clientToken}
 *     >
 *       <CheckoutButtons />
 *     </BraintreePayPalProvider>
 *   );
 * }
 *
 * @example
 * // Inside a child component, use prebuilt buttons or custom hooks:
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
 *   return (
 *     <BraintreePayPalOneTimePaymentButton
 *       amount="100"
 *       currency="USD"
 *       onApprove={handleOnApprove}
 *     />
 *   );
 * }
 */
export const BraintreePayPalProvider: React.FC<
  BraintreePayPalProviderProps
> = ({ namespace, braintreeClientToken, children }) => {
  const [state, dispatch] = useReducer(braintreeReducer, braintreeInitialState);
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
    let isInitializing = true;
    let checkoutInstance: BraintreePayPalCheckoutInstance | undefined;

    const teardown = async () => {
      const instance = checkoutInstance;
      checkoutInstance = undefined;
      try {
        await instance?.teardown();
      } catch {
        // Closing an obsolete instance must not create an unhandled rejection.
      }
    };

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

        const paypalCheckoutInstance = await namespace.paypalCheckoutV6.create({
          client: clientInstance,
        });
        checkoutInstance = paypalCheckoutInstance;

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
        void teardown();
        if (isSubscribed) {
          setError(error);
          dispatch({
            type: BRAINTREE_DISPATCH_ACTION.SET_ERROR,
            value: toError(error),
          });
        }
      } finally {
        isInitializing = false;
        if (!isSubscribed) {
          void teardown();
        }
      }
    };

    initialize();

    return () => {
      isSubscribed = false;
      if (!isInitializing) {
        void teardown();
      }
    };
  }, [namespace, braintreeClientToken, setError]);

  const contextValue: BraintreePayPalState = useMemo(
    () => ({
      braintreePayPalCheckoutInstance: state.braintreePayPalCheckoutInstance,
      eligiblePaymentMethods: state.eligiblePaymentMethods,
      eligiblePaymentMethodsPayload: state.eligiblePaymentMethodsPayload,
      loadingStatus: state.loadingStatus,
      error: state.error,
      isHydrated,
    }),
    [
      state.braintreePayPalCheckoutInstance,
      state.eligiblePaymentMethods,
      state.eligiblePaymentMethodsPayload,
      state.loadingStatus,
      state.error,
      isHydrated,
    ],
  );

  return (
    <BraintreeDispatchContext.Provider value={dispatch}>
      <BraintreePayPalContext.Provider value={contextValue}>
        {children}
      </BraintreePayPalContext.Provider>
    </BraintreeDispatchContext.Provider>
  );
};
