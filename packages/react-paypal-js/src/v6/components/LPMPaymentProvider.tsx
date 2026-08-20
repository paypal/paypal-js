import React, { createContext, useContext, useRef, type JSX } from "react";

import { useLPMOneTimePaymentSession } from "../hooks/useLPMOneTimePaymentSession";

import type { LPMOneTimePaymentSession } from "../types";
import type { LPMName, LPMFieldType } from "../config/lpmRegistry";
import type {
  UseLPMOneTimePaymentSessionProps,
  LPMPaymentSessionReturn,
} from "../hooks/useLPMOneTimePaymentSession";
import type { ButtonProps } from "../types/sdkWebComponents";

// ─── LPM Session Context ──────────────────────────────────────────────────────

/**
 * React context carrying the active `LPMOneTimePaymentSession` instance.
 * Consumed by field components rendered inside an `LPMSessionProvider`.
 */
export const LPMSessionContext = createContext<LPMOneTimePaymentSession | null>(
  null,
);

/**
 * The click handler and pending/error state a payment button needs.
 * Provided alongside {@link LPMSessionContext} by `LPMSessionProvider`, and
 * consumed by button components created with {@link createLPMButtonComponent}.
 */
export interface LPMSessionHandleContextValue {
  handleClick: () => Promise<{ redirectURL?: string } | void>;
  isPending: boolean;
  error: Error | null;
}

/**
 * React context carrying the click handler and pending/error state for the
 * active LPM session. Consumed by button components rendered inside an
 * `LPMSessionProvider`.
 */
export const LPMSessionHandleContext =
  createContext<LPMSessionHandleContextValue | null>(null);

// ─── Enhanced hook return type ─────────────────────────────────────────────────

/**
 * Return type of every `createEnhancedLPMHook`-generated hook.
 *
 * Extends `LPMPaymentSessionReturn` with an `LPMSessionProvider` and a
 * field-component map so merchants can destructure `NameField`, `EmailField`,
 * etc. with correct prop types:
 *
 * ```tsx
 * const { LPMSessionProvider, NameField, isPending } =
 *   useIdealOneTimePaymentSession({ ... });
 *
 * return (
 *   <LPMSessionProvider>
 *     <NameField />
 *     <IdealPaymentButton type="pay" />
 *   </LPMSessionProvider>
 * );
 * ```
 */
export type LPMEnhancedHookReturn = LPMPaymentSessionReturn & {
  /**
   * Wrap field and button components with this provider so they can access
   * the active session through {@link LPMSessionContext} and
   * {@link LPMSessionHandleContext}.
   */
  LPMSessionProvider: (props: { children: React.ReactNode }) => JSX.Element;
  [fieldKey: string]: unknown;
};

// ─── Session handle ───────────────────────────────────────────────────────────

/**
 * The click handler and pending/error state a payment button reads from
 * {@link LPMSessionHandleContext}. Alias of {@link LPMSessionHandleContextValue}
 * kept for naming continuity.
 */
export type LPMSessionHandle = LPMSessionHandleContextValue;

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

export type LPMButtonComponentProps = Omit<ButtonProps, "onClick">;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// ─── Standalone button factory ────────────────────────────────────────────────

/**
 * Creates a named, standalone payment button component (e.g. `IdealPaymentButton`).
 *
 * The component reads its click handler and pending/error state from
 * {@link LPMSessionHandleContext} — render it inside the `LPMSessionProvider`
 * returned by the corresponding `use*OneTimePaymentSession` hook.
 *
 * The underlying SDK web component tag is wrapped internally; merchants never
 * import or reference the raw tag (e.g. `<ideal-button>`).
 *
 * @example
 * // Inside lpmExports.ts:
 * export const IdealPaymentButton =
 *   createLPMButtonComponent("ideal-button", "IdealPaymentButton");
 *
 * // Merchant usage:
 * const { LPMSessionProvider } = useIdealOneTimePaymentSession({ ... });
 * <LPMSessionProvider>
 *   <IdealPaymentButton type="pay" />
 * </LPMSessionProvider>
 */
export function createLPMButtonComponent(
  buttonTag: string,
  displayName: string,
): { (props: LPMButtonComponentProps): JSX.Element; displayName: string } {
  function ButtonComponent({
    type = "pay",
    disabled,
    ...rest
  }: LPMButtonComponentProps): JSX.Element {
    const handle = useContext(LPMSessionHandleContext);
    const isPending = handle?.isPending ?? false;
    const error = handle?.error ?? null;

    return React.createElement(buttonTag, {
      ...rest,
      onClick: handle?.handleClick,
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
 * React concurrent-mode is fully safe. The component reads the current session
 * from {@link LPMSessionContext} — wrap field components with the
 * `LPMSessionProvider` returned by every `use*OneTimePaymentSession` hook.
 */
function createFieldComponent(
  fieldType: LPMFieldType,
): (props: LPMFieldComponentProps) => JSX.Element {
  const componentName = `${capitalize(fieldType)}Field`;

  function FieldComponent({
    containerStyles,
    containerClassName,
    value,
  }: LPMFieldComponentProps): JSX.Element {
    const session = useContext(LPMSessionContext);
    const containerRef = useRef<HTMLDivElement>(null);

    React.useEffect(() => {
      const container = containerRef.current;
      const s = session;
      if (!s?.createPaymentFields || !container) return;
      container.innerHTML = "";
      container.appendChild(
        s.createPaymentFields(
          value !== undefined
            ? { type: fieldType, value }
            : { type: fieldType },
        ),
      );
    }, [session, value]); // eslint-disable-line react-hooks/exhaustive-deps

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
 * underlying `useLPMOneTimePaymentSession` returns **plus** an `LPMSessionProvider`
 * and a pre-bound field component for every field the LPM requires — e.g.
 * `NameField`, `EmailField`.
 *
 * Field component names are derived from the field type in the registry:
 *   `"name"`  → `NameField`
 *   `"email"` → `EmailField`
 *
 * Wrap your field and button components with the returned `LPMSessionProvider`
 * so they can access the active session through {@link LPMSessionContext} and
 * {@link LPMSessionHandleContext}. Import the named button component directly
 * — it reads the click handler and pending/error state from context, no props
 * required.
 *
 * @example
 * const { LPMSessionProvider, NameField, isPending } =
 *   useIdealOneTimePaymentSession({
 *     createOrder: async () => ({ orderId: await createOrder() }),
 *     onApprove:   async ({ orderId }) => { await capture(orderId); },
 *     presentationMode: "popup",
 *   });
 *
 * return (
 *   <LPMSessionProvider>
 *     <section className="billing">
 *       <input name="email" />
 *       <NameField containerStyles={{ marginBottom: 8 }} />
 *     </section>
 *     <IdealPaymentButton type="pay" />
 *   </LPMSessionProvider>
 * );
 */
export function createEnhancedLPMHook(
  lpm: LPMName,
  fieldTypes: ReadonlyArray<LPMFieldType>,
): (
  props: Omit<UseLPMOneTimePaymentSessionProps, "lpm">,
) => LPMEnhancedHookReturn {
  type NamedHookProps = Omit<UseLPMOneTimePaymentSessionProps, "lpm">;

  return function useLPMEnhancedSession(
    props: NamedHookProps,
  ): LPMEnhancedHookReturn {
    const result = useLPMOneTimePaymentSession({
      lpm,
      ...props,
    } as UseLPMOneTimePaymentSessionProps);

    const { session, handleClick, isPending, error } = result;

    // Refs holding the latest session/handle, read synchronously during render
    // by the stable Provider component below. Because the Provider re-renders
    // whenever its caller does (standard JSX reconciliation), reading the ref
    // here — rather than closing over `session`/`handleClick` directly — is
    // all that's needed to propagate updates through context; no pub/sub
    // listener set or effect-driven bridge required.
    const sessionRef = useRef(session);
    sessionRef.current = session;

    const handleRef = useRef<LPMSessionHandleContextValue>({
      handleClick,
      isPending,
      error,
    });
    handleRef.current = { handleClick, isPending, error };

    // Stable Provider component created once per hook instantiation.
    const LPMSessionProviderRef = useRef<
      ((props: { children: React.ReactNode }) => JSX.Element) | null
    >(null);
    if (!LPMSessionProviderRef.current) {
      const LPMSessionProvider = ({
        children,
      }: {
        children: React.ReactNode;
      }): JSX.Element => (
        <LPMSessionContext.Provider value={sessionRef.current}>
          <LPMSessionHandleContext.Provider value={handleRef.current}>
            {children}
          </LPMSessionHandleContext.Provider>
        </LPMSessionContext.Provider>
      );
      LPMSessionProvider.displayName = "LPMSessionProvider";
      LPMSessionProviderRef.current = LPMSessionProvider;
    }

    // Create field components once per hook instantiation (stable identity).
    // Each component reads the session from LPMSessionContext via useContext.
    const fieldComponentsRef =
      useRef<Record<string, (props: LPMFieldComponentProps) => JSX.Element>>();

    if (!fieldComponentsRef.current) {
      const components: Record<
        string,
        (props: LPMFieldComponentProps) => JSX.Element
      > = {};
      for (const fieldType of fieldTypes) {
        const componentName = `${capitalize(fieldType)}Field`;
        components[componentName] = createFieldComponent(fieldType);
      }
      fieldComponentsRef.current = components;
    }

    return {
      ...result,
      LPMSessionProvider: LPMSessionProviderRef.current,
      ...fieldComponentsRef.current,
    } as LPMEnhancedHookReturn;
  };
}
