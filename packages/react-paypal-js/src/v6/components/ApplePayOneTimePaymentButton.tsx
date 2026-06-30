import React, { useEffect, useRef } from "react";

import { useApplePayOneTimePaymentSession } from "../hooks/useApplePayOneTimePaymentSession";
import { usePayPal } from "../hooks/usePayPal";

import type { UseApplePayOneTimePaymentSessionProps } from "../hooks/useApplePayOneTimePaymentSession";
import type { ApplePayButtonElementProps } from "../types/sdkWebComponents";

export type ApplePayOneTimePaymentButtonProps =
  UseApplePayOneTimePaymentSessionProps &
    Omit<ApplePayButtonElementProps, "disabled">;

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
  className,
  ...hookProps
}: ApplePayOneTimePaymentButtonProps): JSX.Element | null => {
  const { error, handleClick, handleDestroy } =
    useApplePayOneTimePaymentSession(hookProps);
  const { isHydrated } = usePayPal();
  const buttonRef = useRef<HTMLElement>(null);
  const handleClickRef = useRef(handleClick);
  handleClickRef.current = handleClick;

  // Apple's <apple-pay-button> manages its own enabled/disabled state internally
  // via canMakePayments(); we deliberately don't add an SDK-level disabled layer
  // (merchants control presentation themselves). React's onClick also doesn't
  // work on the element due to its shadow DOM, so we attach the handler directly.
  useEffect(() => {
    const el = buttonRef.current;
    if (!el) {
      return;
    }
    const onClick = () => {
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
    <div className={className}>
      <apple-pay-button
        ref={buttonRef}
        buttonstyle={buttonstyle}
        type={type}
        locale={locale}
      />
    </div>
  );
};
