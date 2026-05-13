import React, { useEffect, useRef, useCallback } from "react";

import { useGooglePayOneTimePaymentSession } from "../hooks/useGooglePayOneTimePaymentSession";
import { usePayPal } from "../hooks/usePayPal";

import type { UseGooglePayOneTimePaymentSessionProps } from "../hooks/useGooglePayOneTimePaymentSession";

export type GooglePayButtonStyle = {
  /**
   * The Google Pay button type.
   * @see https://developers.google.com/pay/api/web/reference/request-objects#ButtonOptions
   * @default "pay"
   */
  buttonType?:
    | "book"
    | "buy"
    | "checkout"
    | "donate"
    | "order"
    | "pay"
    | "plain"
    | "subscribe";
  /**
   * The Google Pay button color.
   * @default "default"
   */
  buttonColor?: "default" | "black" | "white";
  /**
   * The Google Pay button size mode.
   * @default "fill"
   */
  buttonSizeMode?: "static" | "fill";
  /**
   * The Google Pay button locale (BCP 47).
   */
  buttonLocale?: string;
};

export type GooglePayOneTimePaymentButtonProps =
  UseGooglePayOneTimePaymentSessionProps &
    GooglePayButtonStyle & {
      /**
       * Whether the button is disabled.
       * @default false
       */
      disabled?: boolean;
    };

/**
 * `GooglePayOneTimePaymentButton` renders a native Google Pay button and manages
 * the full Google Pay payment flow via the PayPal SDK.
 *
 * Unlike PayPal/Venmo buttons (which use PayPal web components), this component
 * mounts the native Google Pay button created by `google.payments.api.PaymentsClient.createButton()`.
 *
 * @example
 * ```tsx
 * <GooglePayOneTimePaymentButton
 *   googlePayConfig={googlePayConfig}
 *   transactionInfo={{
 *     countryCode: "US",
 *     currencyCode: "USD",
 *     totalPriceStatus: "FINAL",
 *     totalPrice: "100.00",
 *   }}
 *   createOrder={async () => {
 *     const res = await fetch("/api/orders", { method: "POST" });
 *     const data = await res.json();
 *     return { orderId: data.id };
 *   }}
 *   onApprove={(data) => console.log("Approved:", data)}
 *   onError={(err) => console.error(err)}
 *   buttonColor="black"
 *   buttonType="pay"
 * />
 * ```
 */
export const GooglePayOneTimePaymentButton = ({
  disabled = false,
  buttonType = "pay",
  buttonColor = "default",
  buttonSizeMode = "fill",
  buttonLocale,
  ...hookProps
}: GooglePayOneTimePaymentButtonProps): JSX.Element | null => {
  const {
    error,
    isPending,
    handleClick,
    handleDestroy,
    createGooglePayButton,
  } = useGooglePayOneTimePaymentSession(hookProps);
  const { isHydrated } = usePayPal();
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonMountedRef = useRef(false);
  const handleClickRef = useRef(handleClick);
  handleClickRef.current = handleClick;

  const isDisabled = disabled || isPending || error !== null;

  // Create and mount the Google Pay button
  const mountButton = useCallback(() => {
    const container = containerRef.current;
    if (!container || buttonMountedRef.current) {
      return;
    }

    const mountIfReady = async () => {
      const button = await createGooglePayButton({
        onClick: () => {
          // handleClick already normalizes callback errors into hook state + onError
          handleClickRef.current();
        },
        buttonType,
        buttonColor,
        buttonSizeMode,
        ...(buttonLocale && { buttonLocale }),
      });

      if (!button) {
        return;
      }

      // Clear any previous content and mount the button
      container.replaceChildren(button);
      buttonMountedRef.current = true;
    };

    void mountIfReady();
  }, [
    createGooglePayButton,
    buttonType,
    buttonColor,
    buttonSizeMode,
    buttonLocale,
  ]);

  // Mount the button when hydrated and not pending
  useEffect(() => {
    if (isHydrated && !isPending) {
      // Reset mounted flag when button options change so we remount
      buttonMountedRef.current = false;
      mountButton();
    }
  }, [isHydrated, isPending, mountButton]);

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
      ref={containerRef}
      style={isDisabled ? { pointerEvents: "none", opacity: "0.5" } : undefined}
    />
  );
};
