import React, { useEffect } from "react";

import { useVenmoSavePaymentSession } from "../hooks/useVenmoSavePaymentSession";
import { usePayPal } from "../hooks/usePayPal";

import type { ButtonProps } from "../types";
import type { UseVenmoSavePaymentSessionProps } from "../hooks/useVenmoSavePaymentSession";

type VenmoSavePaymentButtonProps = UseVenmoSavePaymentSessionProps &
  ButtonProps & {
    autoRedirect?: never;
  };

/**
 * `VenmoSavePaymentButton` is a button that provides a Venmo vault/save payment flow
 * (without purchase).
 *
 * `VenmoSavePaymentButtonProps` combines the arguments for {@link UseVenmoSavePaymentSessionProps}
 * and {@link ButtonProps}.
 *
 * `presentationMode` is optional and defaults to `"auto"`.
 *
 * @example
 * <VenmoSavePaymentButton
 *   createVaultToken={async () => {
 *     const response = await fetch('/api/vault/setup-tokens', { method: 'POST' });
 *     return response.json(); // { vaultSetupToken: '...' }
 *   }}
 *   onApprove={({ vaultSetupToken }) => {
 *      // ... on approve logic
 *   }}
 * />
 *
 * @remarks
 * `createVaultToken` is called when the button is clicked, so the setup token is only
 * created if the buyer actually initiates the save flow. Use the `vaultSetupToken` prop
 * instead only if the token was already created before this button renders (for example,
 * fetched by a parent component).
 */
export const VenmoSavePaymentButton = ({
  type = "pay",
  disabled = false,
  ...hookProps
}: VenmoSavePaymentButtonProps): JSX.Element | null => {
  const { error, isPending, handleClick } =
    useVenmoSavePaymentSession(hookProps);
  const { isHydrated } = usePayPal();

  useEffect(() => {
    if (error) {
      console.error(error);
    }
  }, [error]);

  return isHydrated ? (
    <venmo-button
      onClick={handleClick}
      type={type}
      disabled={disabled || isPending || error !== null ? true : undefined}
    ></venmo-button>
  ) : (
    <div />
  );
};
