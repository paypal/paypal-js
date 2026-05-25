import React, { useEffect, useRef, useCallback } from "react";

import { useLPMOneTimePaymentSession } from "../hooks/useLPMOneTimePaymentSession";
import { usePayPal } from "../hooks/usePayPal";
import { LPM_REGISTRY } from "../config/lpmRegistry";

import type { ButtonProps } from "../types";
import type { UseLPMOneTimePaymentSessionProps } from "../hooks/useLPMOneTimePaymentSession";

export type LPMOneTimePaymentButtonProps =
  UseLPMOneTimePaymentSessionProps & ButtonProps;

/**
 * `LPMOneTimePaymentButton` renders the LPM payment fields and button
 * in a self-contained component — matching the same merchant experience as
 * `PayPalOneTimePaymentButton`. Fields (e.g. Full Name) are rendered
 * internally above the button; no manual `session.createPaymentFields()` needed.
 *
 * @example
 * <IdealOneTimePaymentButton
 *   presentationMode="popup"
 *   createOrder={async () => { return { orderId: "..." }; }}
 *   onApprove={async (data) => { /* capture *\/ }}
 * />
 */
export const LPMOneTimePaymentButton = ({
  lpm,
  type = "pay",
  disabled = false,
  ...hookProps
}: LPMOneTimePaymentButtonProps): JSX.Element | null => {
  const config = LPM_REGISTRY[lpm];
  const fieldRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const { error, isPending, session, handleClick } = useLPMOneTimePaymentSession({
    lpm,
    ...hookProps,
  } as UseLPMOneTimePaymentSessionProps);
  const { isHydrated } = usePayPal();

  const setFieldRef = useCallback(
    (fieldType: string) => (el: HTMLDivElement | null) => {
      if (el) fieldRefs.current.set(fieldType, el);
      else fieldRefs.current.delete(fieldType);
    },
    [],
  );

  // Render payment field iframes into their containers when session is ready
  useEffect(() => {
    if (!session || !session.createPaymentFields) return;
    config.fields.forEach((fieldType) => {
      const container = fieldRefs.current.get(fieldType);
      if (container) {
        container.innerHTML = "";
        const fieldElement = session.createPaymentFields({ type: fieldType });
        container.appendChild(fieldElement);
      }
    });
  }, [session, config.fields]);

  useEffect(() => {
    if (error) {
      console.error(error);
    }
  }, [error]);

  if (!isHydrated) {
    return <div />;
  }

  return (
    <div>
      {config.fields.map((fieldType) => (
        <div
          key={fieldType}
          data-testid={`${lpm}-${fieldType}-field`}
          ref={setFieldRef(fieldType)}
          style={{ marginBottom: 8 }}
        />
      ))}
      {React.createElement(config.buttonTag, {
        onClick: handleClick,
        type,
        disabled: disabled || isPending || error !== null ? true : undefined,
      })}
    </div>
  );
};
