import { useEffect, useRef, useState } from "react";

import { useBraintreePayPal } from "./useBraintreePayPal";
import { useIsMountedRef } from "../useIsMounted";
import { useError } from "../useError";
import { useDeepCompareMemoize } from "../../utils";
import { INSTANCE_LOADING_STATE } from "../../types/ProviderEnums";

import type {
  BraintreeEligibilityResult,
  BraintreeFindEligibleMethodsOptions,
} from "../../types/braintree";

export type UseBraintreeEligibleMethodsProps =
  BraintreeFindEligibleMethodsOptions;

export interface UseBraintreeEligibleMethodsReturn {
  eligibleMethods: BraintreeEligibilityResult | null;
  isPending: boolean;
  error: Error | null;
}

/**
 * Hook for fetching Braintree PayPal eligibility for given checkout options.
 *
 * Calls {@link https://braintree.github.io/braintree-web/current/PayPalCheckoutV6.html#findEligibleMethods | BraintreePayPalCheckoutInstance.findEligibleMethods}
 * on the shared instance from {@link useBraintreePayPal} and re-fetches when the
 * options change. Use to gate rendering of buttons (e.g. Pay Later) on eligibility.
 *
 * `isPending` is true while the provider's checkout instance is initializing
 * OR while eligibility is being fetched.
 *
 * @example
 * function Checkout() {
 *   const { eligibility, isPending, error } = useBraintreeEligibleMethods({
 *     amount: "10.00",
 *     currency: "USD",
 *     countryCode: "US",
 *     paymentFlow: "ONE_TIME_PAYMENT",
 *   });
 *
 *   if (isPending) return <Spinner />;
 *   if (error) return <ErrorMessage error={error} />;
 *
 *   return (
 *     <>
 *       {eligibility?.paypal && <BraintreePayPalOneTimePaymentButton ... />}
 *       {eligibility?.paylater && <PayPalPayLaterButton ... />}
 *     </>
 *   );
 * }
 */
export function useBraintreeEligibleMethods({
  amount,
  currency,
  countryCode,
  paymentFlow,
}: UseBraintreeEligibleMethodsProps): UseBraintreeEligibleMethodsReturn {
  const { braintreePayPalCheckoutInstance, loadingStatus } =
    useBraintreePayPal();
  const isMountedRef = useIsMountedRef();
  const [error, setError] = useError();
  const [eligibleMethods, setEligibleMethods] =
    useState<BraintreeEligibilityResult | null>(null);
  const [isFetching, setIsFetching] = useState(false);

  const memoizedOptions = useDeepCompareMemoize({
    amount,
    currency,
    countryCode,
    paymentFlow,
  });

  // Prevents retrying with a checkout instance whose findEligibleMethods has already failed
  const failedInstanceRef = useRef<unknown>(null);

  useEffect(() => {
    if (failedInstanceRef.current !== braintreePayPalCheckoutInstance) {
      failedInstanceRef.current = null;
    }

    if (!braintreePayPalCheckoutInstance) {
      return;
    }

    if (failedInstanceRef.current === braintreePayPalCheckoutInstance) {
      return;
    }

    let isSubscribed = true;
    setIsFetching(true);
    setEligibleMethods(null);
    setError(null);

    braintreePayPalCheckoutInstance
      .findEligibleMethods(memoizedOptions)
      .then((result) => {
        if (!isSubscribed || !isMountedRef.current) {
          return;
        }
        setEligibleMethods(result);
      })
      .catch((err: unknown) => {
        if (!isSubscribed || !isMountedRef.current) {
          return;
        }
        failedInstanceRef.current = braintreePayPalCheckoutInstance;
        setError(err);
      })
      .finally(() => {
        if (!isSubscribed || !isMountedRef.current) {
          return;
        }
        setIsFetching(false);
      });

    return () => {
      isSubscribed = false;
    };
  }, [
    braintreePayPalCheckoutInstance,
    memoizedOptions,
    setError,
    isMountedRef,
  ]);

  const isPending =
    loadingStatus === INSTANCE_LOADING_STATE.PENDING || isFetching;

  return {
    eligibleMethods,
    isPending,
    error,
  };
}
