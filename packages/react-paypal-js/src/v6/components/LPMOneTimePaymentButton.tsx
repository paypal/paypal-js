import React, { useEffect, useRef, useCallback, type JSX } from "react";

import { useLPMOneTimePaymentSession } from "../hooks/useLPMOneTimePaymentSession";
import { usePayPal } from "../hooks/usePayPal";
import { LPM_REGISTRY } from "../config/lpmRegistry";

import type { ButtonProps } from "../types";
import type { UseLPMOneTimePaymentSessionProps } from "../hooks/useLPMOneTimePaymentSession";

export type LPMOneTimePaymentButtonProps = UseLPMOneTimePaymentSessionProps &
  ButtonProps & {
    /**
     * Optional initial values to prefill the rendered payment fields, keyed by
     * field type (e.g. `{ name: "John Doe", email: "john@example.com" }`).
     * Maps to the SDK `createPaymentFields({ value })` option.
     */
    fieldValues?: Record<string, string>;
    /**
     * Optional CSS styles applied to each field's container `<div>`.
     * Defaults to `{ marginBottom: 8 }` when not provided.
     */
    fieldContainerStyle?: React.CSSProperties;
    /**
     * Optional CSS class name applied to each field's container `<div>`.
     */
    fieldContainerClassName?: string;
  };

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
  fieldValues,
  fieldContainerStyle,
  fieldContainerClassName,
  ...hookProps
}: LPMOneTimePaymentButtonProps): JSX.Element | null => {
  const config = LPM_REGISTRY[lpm];
  const fieldRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const { error, isPending, session, handleClick } =
    useLPMOneTimePaymentSession({
      lpm,
      ...hookProps,
    } as UseLPMOneTimePaymentSessionProps);
  const { isHydrated } = usePayPal();

  const setFieldRef = useCallback(
    (fieldType: string) => (el: HTMLDivElement | null) => {
      if (el) {
        fieldRefs.current.set(fieldType, el);
      } else {
        fieldRefs.current.delete(fieldType);
      }
    },
    [],
  );

  // Render payment field iframes into their containers when session is ready
  useEffect(() => {
    if (!session || !session.createPaymentFields) {
      return;
    }
    config.fields.forEach((fieldType) => {
      const container = fieldRefs.current.get(fieldType);
      if (container) {
        container.innerHTML = "";
        const value = fieldValues?.[fieldType];
        const fieldElement = session.createPaymentFields(
          value !== undefined
            ? { type: fieldType, value }
            : { type: fieldType },
        );
        container.appendChild(fieldElement);
      }
    });
  }, [session, config.fields, fieldValues]);

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
          style={fieldContainerStyle ?? { marginBottom: 8 }}
          className={fieldContainerClassName}
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
