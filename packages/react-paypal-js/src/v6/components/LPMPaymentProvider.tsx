import React, { useEffect, useReducer, useRef, type JSX } from "react";

import { useLPMOneTimePaymentSession } from "../hooks/useLPMOneTimePaymentSession";

import type { LPMName } from "../config/lpmRegistry";
import type { UseLPMOneTimePaymentSessionProps, LPMPaymentSessionReturn } from "../hooks/useLPMOneTimePaymentSession";
import type { ButtonProps } from "../types/sdkWebComponents";

// ─── Enhanced hook return type ─────────────────────────────────────────────────

/** Return type of every `createEnhancedLPMHook`-generated hook.
 *
 * Extends `LPMPaymentSessionReturn` with a field-component map so merchants
 * can destructure `NameField`, `EmailField`, etc. with correct prop types:
 *
 * ```tsx
 * const { NameField, handleClick, isPending } = useIdealOneTimePaymentSession({ ... });
 * ```
 */
export type LPMEnhancedHookReturn = LPMPaymentSessionReturn & {
  [fieldKey: string]: (props: LPMFieldComponentProps) => JSX.Element;
};

// ─── Session handle ───────────────────────────────────────────────────────────

/**
 * The minimal slice of the hook return value that `IdealPaymentButton` (and
 * equivalent named buttons) require as their `paymentSession` prop.
 *
 * The return value of every `use*OneTimePaymentSession` hook satisfies this
 * interface, so you can pass the hook result directly:
 *
 * @example
 * const idealSession = useIdealOneTimePaymentSession({ ... });
 * <IdealPaymentButton paymentSession={idealSession} />
 */
export interface LPMSessionHandle {
  handleClick: () => Promise<{ redirectURL?: string } | void>;
  isPending: boolean;
  error: Error | null;
}

// ─── Shared prop types ────────────────────────────────────────────────────────

export type LPMFieldComponentProps = {
  containerStyles?: React.CSSProperties;
  containerClassName?: string;
};

export type LPMButtonComponentProps = Omit<ButtonProps, "onClick"> & {
  /**
   * The session handle — pass the return value of the corresponding
   * `use*OneTimePaymentSession` hook directly.
   *
   * @example
   * const idealSession = useIdealOneTimePaymentSession({ ... });
   * <IdealPaymentButton paymentSession={idealSession} type="pay" />
   */
  paymentSession: LPMSessionHandle;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// ─── Standalone button factory ────────────────────────────────────────────────

/**
 * Creates a named, standalone payment button component (e.g. `IdealPaymentButton`).
 *
 * The component accepts a `paymentSession` prop — the return value of the
 * corresponding `use*OneTimePaymentSession` hook. Because the session is passed
 * explicitly, the button can live **anywhere** in the component tree with no
 * Provider or subtree restriction.
 *
 * The underlying SDK web component tag is wrapped internally; merchants never
 * import or reference the raw tag (e.g. `<ideal-button>`).
 *
 * @example
 * // Inside lpmProviderExports.ts:
 * export const IdealPaymentButton =
 *   createLPMButtonComponent("ideal-button", "IdealPaymentButton");
 *
 * // Merchant usage:
 * const idealSession = useIdealOneTimePaymentSession({ ... });
 * <IdealPaymentButton paymentSession={idealSession} type="pay" />
 */
export function createLPMButtonComponent(
  buttonTag: string,
  displayName: string,
): { (props: LPMButtonComponentProps): JSX.Element; displayName: string } {
  function ButtonComponent({
    paymentSession,
    type = "pay",
    disabled,
    ...rest
  }: LPMButtonComponentProps): JSX.Element {
    const { handleClick, isPending, error } = paymentSession;

    return React.createElement(buttonTag, {
      ...rest,
      onClick: handleClick,
      type,
      disabled: disabled || isPending || error !== null ? true : undefined,
    });
  }

  ButtonComponent.displayName = displayName;
  return ButtonComponent;
}

// ─── Enhanced hook factory ────────────────────────────────────────────────────

/**
 * Creates a named `use*OneTimePaymentSession` hook that returns everything the
 * underlying `useLPMOneTimePaymentSession` returns **plus** a pre-bound field
 * component for every field the LPM requires — e.g. `NameField`, `EmailField`.
 *
 * Field component names are derived from the field type in the registry:
 *   `"name"`  → `NameField`
 *   `"email"` → `EmailField`
 *
 * The `PaymentButton` is **not** included in the hook return; import the
 * named button component directly and pass the hook's return value as
 * `paymentSession`:
 *
 * @example
 * const { NameField, session, isPending } = useIdealOneTimePaymentSession({
 *   createOrder: async () => ({ orderId: await createOrder() }),
 *   onApprove:   async ({ orderId }) => { await capture(orderId); },
 *   presentationMode: "popup",
 * });
 *
 * // NameField can live anywhere — no Provider needed:
 * <section className="billing">
 *   <input name="email" />               // merchant's own field
 *   <NameField containerStyles={{ marginBottom: 8 }} />
 * </section>
 *
 * // Button is imported separately and receives the session as a prop:
 * import { IdealPaymentButton } from "@paypal/react-paypal-js";
 * <footer>
 *   <IdealPaymentButton paymentSession={idealSession} type="pay" />
 * </footer>
 */
export function createEnhancedLPMHook(
  lpm: LPMName,
  fieldTypes: ReadonlyArray<string>,
): (props: Omit<UseLPMOneTimePaymentSessionProps, "lpm">) => LPMEnhancedHookReturn {

  type NamedHookProps = Omit<UseLPMOneTimePaymentSessionProps, "lpm">;

  return function useLPMEnhancedSession(props: NamedHookProps): LPMEnhancedHookReturn {
    const result = useLPMOneTimePaymentSession({
      lpm,
      ...props,
    } as UseLPMOneTimePaymentSessionProps);

    const { session } = result;

    // ── Stable ref + listener store for field components ────────────────────
    //
    // Field components are created once (via useRef) and subscribe to this
    // store. When the session changes, we notify subscribers so they call
    // bumpVersion and re-run the mount-field effect without React ever
    // treating the component as a new type (= no unmount/remount, no lost iframe).

    const sessionRef = useRef(session);
    const sessionListenersRef = useRef(new Set<() => void>());

    useEffect(() => {
      sessionRef.current = session;
      sessionListenersRef.current.forEach((l) => l());
    }, [session]);

    // ── Stable field component instances — created once per hook call ───────

    const fieldComponentsRef = useRef<
      Record<string, (props: LPMFieldComponentProps) => JSX.Element>
    >();

    if (!fieldComponentsRef.current) {
      const components: Record<
        string,
        (props: LPMFieldComponentProps) => JSX.Element
      > = {};

      for (const fieldType of fieldTypes) {
        const componentName = capitalize(fieldType) + "Field"; // e.g. "NameField"

        // fieldType is block-scoped per for…of iteration, so each closure
        // captures the correct value.
        const FieldComponent = ({
          containerStyles,
          containerClassName,
        }: LPMFieldComponentProps): JSX.Element => {
          const [sessionVersion, bumpVersion] = useReducer(
            (n: number) => n + 1,
            0,
          );
          const containerRef = useRef<HTMLDivElement>(null);

          // Subscribe to session changes for the lifetime of this component.
          useEffect(() => {
            sessionListenersRef.current.add(bumpVersion);
            return () => {
              sessionListenersRef.current.delete(bumpVersion);
            };
          }, []); // eslint-disable-line react-hooks/exhaustive-deps

          // Mount (or re-mount) the SDK iframe whenever the session version
          // changes — i.e. whenever a new session becomes available.
          useEffect(() => {
            const container = containerRef.current;
            const s = sessionRef.current;
            if (!s?.createPaymentFields || !container) { return; }
            container.innerHTML = "";
            container.appendChild(s.createPaymentFields({ type: fieldType }));
          }, [sessionVersion]); // eslint-disable-line react-hooks/exhaustive-deps

          return (
            <div
              ref={containerRef}
              style={containerStyles}
              className={containerClassName}
            />
          );
        }

        FieldComponent.displayName = componentName;
        components[componentName] =
          FieldComponent as (props: LPMFieldComponentProps) => JSX.Element;
      }

      fieldComponentsRef.current = components;
    }

    return {
      ...result,
      ...fieldComponentsRef.current,
    } as LPMEnhancedHookReturn;
  };
}
