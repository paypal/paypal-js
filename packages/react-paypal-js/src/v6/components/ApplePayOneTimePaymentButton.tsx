import React, { useEffect, useRef } from "react";

import { useApplePayOneTimePaymentSession } from "../hooks/useApplePayOneTimePaymentSession";
import { usePayPal } from "../hooks/usePayPal";

import type { UseApplePayOneTimePaymentSessionProps } from "../hooks/useApplePayOneTimePaymentSession";
import type { ApplePayButtonElementProps } from "../types/sdkWebComponents";

export type ApplePayOneTimePaymentButtonProps =
  UseApplePayOneTimePaymentSessionProps & ApplePayButtonElementProps;

/**
 * `ApplePayOneTimePaymentButton` renders a native Apple Pay button and manages
 * the full Apple Pay payment flow via the PayPal SDK.
 *
 * @example
 * ```tsx
 * <ApplePayOneTimePaymentButton
 *   applePayConfig={applePayConfig}
 *   paymentRequest={{
 *     countryCode: "US",
 *     currencyCode: "USD",
 *     total: { label: "Demo Store", amount: "100.00", type: "final" },
 *   }}
 *   createOrder={async () => {
 *     const res = await fetch("/api/orders", { method: "POST" });
 *     const data = await res.json();
 *     return { orderId: data.id };
 *   }}
 *   onApprove={(data) => console.log("Approved:", data)}
 *   onError={(err) => console.error(err)}
 * />
 * ```
 */
export const ApplePayOneTimePaymentButton = ({
  buttonstyle = "black",
  type = "pay",
  locale = "en",
  disabled = false,
  className,
  ...hookProps
}: ApplePayOneTimePaymentButtonProps): JSX.Element | null => {
  const { error, isPending, handleClick, handleDestroy } =
    useApplePayOneTimePaymentSession(hookProps);
  const { isHydrated } = usePayPal();
  const buttonRef = useRef<HTMLElement>(null);
  const handleClickRef = useRef(handleClick);
  handleClickRef.current = handleClick;

  const isDisabled = disabled || isPending;
  // Apple's <apple-pay-button> does not observe a `disabled` attribute and
  // manages it internally via canMakePayments(), so we never write it. Instead
  // we gate interaction in JS. The click listener below is attached once on
  // mount, so keep the latest disabled value in a ref to avoid a stale closure.
  const isDisabledRef = useRef(isDisabled);
  isDisabledRef.current = isDisabled;

  // React's onClick doesn't work on <apple-pay-button> due to its shadow DOM,
  // so we attach the click handler directly on the element.
  useEffect(() => {
    const el = buttonRef.current;
    if (!el) {
      return;
    }
    const onClick = () => {
      // Source of truth for the disabled state. Covers keyboard activation,
      // which pointer-events: none on the wrapper cannot block.
      if (isDisabledRef.current) {
        return;
      }
      handleClickRef.current().catch(() => {
        // Errors are captured by the hook's setError
      });
    };

    el.addEventListener("click", onClick);
    return () => el.removeEventListener("click", onClick);
  }, []);

  useEffect(() => {
    if (error) {
      console.error(error);
    }
  }, [error]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      handleDestroy();
    };
  }, [handleDestroy]);

  if (!isHydrated) {
    return <div />;
  }

  return (
    <div
      className={className}
      aria-disabled={isDisabled || undefined}
      style={isDisabled ? { pointerEvents: "none", opacity: "0.5" } : undefined}
    >
      <apple-pay-button
        ref={buttonRef}
        buttonstyle={buttonstyle}
        type={type}
        locale={locale}
      />
    </div>
  );
};
