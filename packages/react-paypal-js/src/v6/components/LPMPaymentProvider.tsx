import React, { useEffect, useReducer, useRef, type JSX } from "react";

import { useLPMOneTimePaymentSession } from "../hooks/useLPMOneTimePaymentSession";

import type { LPMOneTimePaymentSession } from "../types";
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
  /**
   * Optional initial value to prefill the field with (maps to the SDK
   * `createPaymentFields({ value })` option). Useful for demos or restoring a
   * buyer's previously entered value.
   */
  value?: string;
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

// ─── Module-level field component factory ─────────────────────────────────────

/**
 * Creates a stable SDK-iframe field component for a given field type.
 *
 * This is a module-level factory (not defined inside the hook render) so
 * React concurrent-mode is fully safe and no ESLint suppression is required.
 * The returned component is created once per `createEnhancedLPMHook` call via
 * `useRef` and will not unmount/remount when the session changes — instead it
 * uses a version counter driven by a pub/sub listener on `sessionListenersRef`.
 */
function createFieldComponent(
  fieldType: string,
  sessionRef: React.MutableRefObject<LPMOneTimePaymentSession | null>,
  sessionListenersRef: React.MutableRefObject<Set<() => void>>,
): (props: LPMFieldComponentProps) => JSX.Element {
  const componentName = `${capitalize(fieldType)}Field`;

  function FieldComponent({
    containerStyles,
    containerClassName,
    value,
  }: LPMFieldComponentProps): JSX.Element {
    const [sessionVersion, bumpVersion] = useReducer((n: number) => n + 1, 0);
    const containerRef = useRef<HTMLDivElement>(null);

    // Subscribe to session changes for the lifetime of this field component.
    // bumpVersion is a stable dispatch from useReducer; sessionListenersRef is
    // a stable ref — the effect only needs to run once on mount.
    useEffect(() => {
      const listeners = sessionListenersRef.current;
      listeners.add(bumpVersion);
      return () => {
        listeners.delete(bumpVersion);
      };
    }, [bumpVersion]);

    // Mount (or re-mount) the SDK iframe whenever the session version changes,
    // i.e. whenever a new session becomes available via the pub/sub mechanism.
    // sessionRef.current is accessed imperatively; fieldType is a stable
    // closure variable from the factory — neither belongs in the deps array.
    useEffect(() => {
      const container = containerRef.current;
      const s = sessionRef.current;
      if (!s?.createPaymentFields || !container) return;
      container.innerHTML = "";
      container.appendChild(
        s.createPaymentFields(
          value !== undefined ? { type: fieldType, value } : { type: fieldType },
        ),
      );
    }, [sessionVersion, value]); // eslint-disable-line react-hooks/exhaustive-deps

    return (
      <div
        ref={containerRef}
        style={containerStyles}
        className={containerClassName}
      />
    );
  }

  FieldComponent.displayName = componentName;
  return FieldComponent as (props: LPMFieldComponentProps) => JSX.Element;
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

    // Stable refs shared with field components created below.
    // sessionRef is updated every render (via useEffect) so field components
    // always access the latest session without needing to re-subscribe.
    const sessionRef = useRef(session);
    const sessionListenersRef = useRef(new Set<() => void>());

    useEffect(() => {
      sessionRef.current = session;
      sessionListenersRef.current.forEach((l) => l());
    }, [session]);

    // Create field components once per hook instantiation (stable identity).
    // Each component is produced by the module-level `createFieldComponent`
    // factory, which closes over `sessionRef` and `sessionListenersRef`.
    const fieldComponentsRef = useRef<
      Record<string, (props: LPMFieldComponentProps) => JSX.Element>
    >();

    if (!fieldComponentsRef.current) {
      const components: Record<string, (props: LPMFieldComponentProps) => JSX.Element> = {};
      for (const fieldType of fieldTypes) {
        const componentName = `${capitalize(fieldType)}Field`;
        components[componentName] = createFieldComponent(
          fieldType,
          sessionRef,
          sessionListenersRef,
        );
      }
      fieldComponentsRef.current = components;
    }

    return {
      ...result,
      ...fieldComponentsRef.current,
    } as LPMEnhancedHookReturn;
  };
}
