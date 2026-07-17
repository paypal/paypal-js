import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type JSX,
} from "react";

import { useLPMOneTimePaymentSession } from "../hooks/useLPMOneTimePaymentSession";

import type { LPMOneTimePaymentSession } from "../types";
import type { LPMName } from "../config/lpmRegistry";
import type { UseLPMOneTimePaymentSessionProps, LPMPaymentSessionReturn } from "../hooks/useLPMOneTimePaymentSession";
import type { ButtonProps } from "../types/sdkWebComponents";

// ─── LPM Session Context ──────────────────────────────────────────────────────

/**
 * React context carrying the active `LPMOneTimePaymentSession` instance.
 * Consumed by field components rendered inside an `LPMSessionProvider`.
 */
export const LPMSessionContext = createContext<LPMOneTimePaymentSession | null>(null);

// ─── Enhanced hook return type ─────────────────────────────────────────────────

/**
 * Return type of every `createEnhancedLPMHook`-generated hook.
 *
 * Extends `LPMPaymentSessionReturn` with an `LPMSessionProvider` and a
 * field-component map so merchants can destructure `NameField`, `EmailField`,
 * etc. with correct prop types:
 *
 * ```tsx
 * const { LPMSessionProvider, NameField, handleClick, isPending } =
 *   useIdealOneTimePaymentSession({ ... });
 *
 * return (
 *   <LPMSessionProvider>
 *     <NameField />
 *     <IdealPaymentButton paymentSession={idealSession} type="pay" />
 *   </LPMSessionProvider>
 * );
 * ```
 */
export type LPMEnhancedHookReturn = LPMPaymentSessionReturn & {
  /** Wrap field components with this provider to give them access to the LPM session. */
  LPMSessionProvider: (props: { children: React.ReactNode }) => JSX.Element;
  [fieldKey: string]: unknown;
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
 * React concurrent-mode is fully safe. The component reads the current session
 * from {@link LPMSessionContext} — wrap field components with the
 * `LPMSessionProvider` returned by every `use*OneTimePaymentSession` hook.
 */
function createFieldComponent(
  fieldType: string,
): (props: LPMFieldComponentProps) => JSX.Element {
  const componentName = `${capitalize(fieldType)}Field`;

  function FieldComponent({
    containerStyles,
    containerClassName,
    value,
  }: LPMFieldComponentProps): JSX.Element {
    const session = useContext(LPMSessionContext);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const container = containerRef.current;
      const s = session;
      if (!s?.createPaymentFields || !container) return;
      container.innerHTML = "";
      container.appendChild(
        s.createPaymentFields(
          value !== undefined ? { type: fieldType, value } : { type: fieldType },
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
 * so they can access the active session through {@link LPMSessionContext}.
 * The `PaymentButton` is **not** included in the hook return; import the
 * named button component directly and pass the hook's return value as
 * `paymentSession`:
 *
 * @example
 * const { LPMSessionProvider, NameField, session, isPending } =
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
 *     <IdealPaymentButton paymentSession={idealSession} type="pay" />
 *   </LPMSessionProvider>
 * );
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

    // Keep a ref to the latest session so the Provider can seed its initial state.
    const sessionRef = useRef(session);
    // Ref to the Provider's state setter — populated when the Provider mounts.
    const providerSetterRef = useRef<React.Dispatch<React.SetStateAction<LPMOneTimePaymentSession | null>> | null>(null);

    // When the session changes, sync the ref and push the update into the Provider.
    useEffect(() => {
      sessionRef.current = session;
      providerSetterRef.current?.(session);
    }, [session]);

    // Stable Provider component created once per hook instantiation.
    // It holds the session in local state so context consumers re-render
    // when the session changes — with no pub/sub listener sets required.
    const LPMSessionProviderRef = useRef<((props: { children: React.ReactNode }) => JSX.Element) | null>(null);
    if (!LPMSessionProviderRef.current) {
      function LPMSessionProvider({ children }: { children: React.ReactNode }): JSX.Element {
        const [sessionValue, setSessionValue] = useState<LPMOneTimePaymentSession | null>(
          sessionRef.current,
        );

        useEffect(() => {
          // Register the state setter so the outer hook can push session updates.
          providerSetterRef.current = setSessionValue;
          return () => {
            providerSetterRef.current = null;
          };
        }, []);

        return (
          <LPMSessionContext.Provider value={sessionValue}>
            {children}
          </LPMSessionContext.Provider>
        );
      }
      LPMSessionProvider.displayName = "LPMSessionProvider";
      LPMSessionProviderRef.current = LPMSessionProvider;
    }

    // Create field components once per hook instantiation (stable identity).
    // Each component reads the session from LPMSessionContext via useContext.
    const fieldComponentsRef = useRef<
      Record<string, (props: LPMFieldComponentProps) => JSX.Element>
    >();

    if (!fieldComponentsRef.current) {
      const components: Record<string, (props: LPMFieldComponentProps) => JSX.Element> = {};
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
