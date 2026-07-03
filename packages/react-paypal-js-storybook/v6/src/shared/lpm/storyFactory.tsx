/**
 * Factory that generates Storybook `meta` + named stories for any unbranded LPM.
 *
 * Usage in a story file:
 *
 *   const stories = createLPMStory("ideal");
 *   export default stories.meta;
 *   export const Default = stories.Default;
 *   export const EagerOrder = stories.EagerOrder;
 *   export const WithHookPattern = stories.WithHookPattern;
 */

import React, { useEffect, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { action } from "storybook/actions";

import * as LPMExports from "@paypal/react-paypal-js/sdk-v6/local-payment-methods";
import type {
  LPMName,
  LPMButtonComponentProps,
  LPMSessionHandle,
} from "@paypal/react-paypal-js/sdk-v6/local-payment-methods";

import { withLPMPayPalProvider } from "../../decorators";
import { V6DocPageStructure } from "../../components";
import { createOrder, captureOrder } from "../utils";
import { dispatchPaymentResult } from "../PaymentResult";
import { getLPMAllInOneCode, getLPMEagerOrderCode, getLPMHookPatternCode } from "./code";
import {
  presentationModeArgType,
  disabledArgType,
  phoneArgTypes,
  billingAddressArgTypes,
  taxInfoArgTypes,
  floaArgTypes,
  defaultPhoneArgs,
  defaultBillingAddressArgs,
  defaultTaxInfoArgs,
  defaultFloaArgs,
  buildPhone,
  buildBillingAddress,
  buildTaxInfo,
  lpmCallbacks,
} from "./utils";

// ─── Types ────────────────────────────────────────────────────────────────────

export type LPMStoryArgs = {
  disabled: boolean;
  presentationMode: "auto" | "popup";
  // phone
  phoneCountryCode?: string;
  phoneNationalNumber?: string;
  // billing address
  billingAddressLine1?: string;
  billingAddressLine2?: string;
  billingAdminArea1?: string;
  billingAdminArea2?: string;
  billingPostalCode?: string;
  billingCountryCode?: string;
  // tax info
  taxId?: string;
  taxIdType?: string;
  // floa specific
  dateOfBirth?: string;
  numberOfInstallments?: number;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function toPascal(lpmKey: string): string {
  return lpmKey.charAt(0).toUpperCase() + lpmKey.slice(1);
}

/** Resolves a named export from the LPM exports object by key. */
function getLPMExport<T>(name: string): T {
  return (LPMExports as Record<string, unknown>)[name] as T;
}

/** Builds the session field extras to merge into createOrder's return value. */
function buildSessionExtras(
  sessionFields: readonly string[],
  args: LPMStoryArgs,
) {
  const extras: Record<string, unknown> = {};

  if (sessionFields.includes("phone") && args.phoneCountryCode && args.phoneNationalNumber) {
    extras.phone = buildPhone(args.phoneCountryCode, args.phoneNationalNumber);
  }
  if (sessionFields.includes("billingAddress") && args.billingAddressLine1) {
    extras.billingAddress = buildBillingAddress({
      billingAddressLine1: args.billingAddressLine1 ?? "",
      billingAddressLine2: args.billingAddressLine2,
      billingAdminArea1: args.billingAdminArea1 ?? "",
      billingAdminArea2: args.billingAdminArea2 ?? "",
      billingPostalCode: args.billingPostalCode ?? "",
      billingCountryCode: args.billingCountryCode ?? "",
    });
  }
  if (sessionFields.includes("taxInfo") && args.taxId) {
    extras.taxInfo = buildTaxInfo(args.taxId, args.taxIdType ?? "BR_CPF");
  }
  if (sessionFields.includes("dateOfBirth") && args.dateOfBirth) {
    extras.dateOfBirth = args.dateOfBirth;
  }
  if (sessionFields.includes("numberOfInstallments") && args.numberOfInstallments != null) {
    extras.numberOfInstallments = args.numberOfInstallments;
  }

  return extras;
}

/** Builds the argTypes for a given LPM based on its required session fields. */
function buildArgTypes(sessionFields: readonly string[]) {
  const base = {
    disabled: disabledArgType,
    presentationMode: presentationModeArgType,
  };
  if (sessionFields.includes("phone")) {
    Object.assign(base, phoneArgTypes);
  }
  if (sessionFields.includes("billingAddress")) {
    Object.assign(base, billingAddressArgTypes);
  }
  if (sessionFields.includes("taxInfo")) {
    Object.assign(base, taxInfoArgTypes);
  }
  if (sessionFields.includes("dateOfBirth") || sessionFields.includes("numberOfInstallments")) {
    Object.assign(base, floaArgTypes);
  }
  return base;
}

/** Builds the default arg values including session field defaults. */
function buildDefaultArgs(sessionFields: readonly string[]): LPMStoryArgs {
  const base: LPMStoryArgs = {
    disabled: false,
    presentationMode: "auto",
  };
  if (sessionFields.includes("phone")) {
    Object.assign(base, defaultPhoneArgs);
  }
  if (sessionFields.includes("billingAddress")) {
    Object.assign(base, defaultBillingAddressArgs);
  }
  if (sessionFields.includes("taxInfo")) {
    Object.assign(base, defaultTaxInfoArgs);
  }
  if (sessionFields.includes("dateOfBirth") || sessionFields.includes("numberOfInstallments")) {
    Object.assign(base, defaultFloaArgs);
  }
  return base;
}

// ─── Story wrapper components ─────────────────────────────────────────────────

type AllInOneWrapperProps = LPMStoryArgs & {
  ButtonComponent: React.ComponentType<Record<string, unknown>>;
  sessionFields: readonly string[];
};

function AllInOneWrapper({ ButtonComponent, sessionFields, disabled, presentationMode, ...rest }: AllInOneWrapperProps) {
  const storyArgs = { disabled, presentationMode, ...rest } as LPMStoryArgs;
  const extras = buildSessionExtras(sessionFields, storyArgs);

  const createLPMOrder = async () => {
    const { orderId } = await createOrder();
    return { orderId, ...extras };
  };

  const onApprove = async (data: { orderId: string }) => {
    const orderData = await captureOrder(data.orderId);
    action("approve")({ ...orderData, orderID: data.orderId });
    dispatchPaymentResult(
      "success",
      `Payment captured successfully. Order ID: ${data.orderId}`,
    );
  };

  const onCancel = (data: unknown) => {
    action("cancel")(data);
    dispatchPaymentResult("cancel", "Payment was cancelled by the buyer.");
  };

  const onError = (error: unknown) => {
    action("error")(error);
    dispatchPaymentResult(
      "error",
      `Payment error: ${(error as { message?: string })?.message || "Unknown error"}`,
    );
  };

  return React.createElement(ButtonComponent, {
    disabled,
    presentationMode,
    createOrder: createLPMOrder,
    onApprove,
    onCancel,
    onError,
    type: "pay",
  });
}

type EagerOrderWrapperProps = LPMStoryArgs & {
  ButtonComponent: React.ComponentType<Record<string, unknown>>;
};

function EagerOrderWrapper({ ButtonComponent, disabled, presentationMode }: EagerOrderWrapperProps) {
  const [orderId, setOrderId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    createOrder()
      .then(({ orderId: id }) => {
        setOrderId(id);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return <div style={{ color: "#555" }}>Creating order…</div>;
  }
  if (!orderId) {
    return <div style={{ color: "#c53030" }}>Failed to create order. Is the sample integration server running?</div>;
  }

  const onApprove = async (data: { orderId: string }) => {
    const orderData = await captureOrder(data.orderId);
    action("approve")({ ...orderData, orderID: data.orderId });
    dispatchPaymentResult("success", `Payment captured. Order ID: ${data.orderId}`);
  };

  return React.createElement(ButtonComponent, {
    orderId,
    disabled,
    presentationMode,
    ...lpmCallbacks,
    onApprove,
    type: "pay",
  });
}

type HookPatternWrapperProps = LPMStoryArgs & {
  lpmKey: LPMName;
  sessionFields: readonly string[];
  fields: readonly string[];
};

function HookPatternWrapper({ lpmKey, sessionFields, fields, disabled, presentationMode, ...rest }: HookPatternWrapperProps) {
  const storyArgs = { disabled, presentationMode, ...rest } as LPMStoryArgs;
  const extras = buildSessionExtras(sessionFields, storyArgs);
  const pascal = toPascal(lpmKey);

  const useHook = getLPMExport<(props: Record<string, unknown>) => Record<string, unknown>>(
    `use${pascal}OneTimePaymentSession`,
  );
  const StandaloneButton = getLPMExport<React.ComponentType<LPMButtonComponentProps>>(
    `${pascal}PaymentButton`,
  );

  const createLPMOrder = async () => {
    const { orderId } = await createOrder();
    return { orderId, ...extras };
  };

  const onApprove = async (data: { orderId: string }) => {
    const orderData = await captureOrder(data.orderId);
    action("approve")({ ...orderData, orderID: data.orderId });
    dispatchPaymentResult("success", `Payment captured. Order ID: ${data.orderId}`);
  };

  const sessionResult = useHook({
    createOrder: createLPMOrder,
    onApprove,
    onCancel: lpmCallbacks.onCancel,
    onError: lpmCallbacks.onError,
    presentationMode,
  });

  const paymentSession: LPMSessionHandle = {
    handleClick: sessionResult.handleClick as LPMSessionHandle["handleClick"],
    isPending: sessionResult.isPending as boolean,
    error: sessionResult.error as Error | null,
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      {fields.map((fieldType) => {
        const FieldComponent = sessionResult[`${capitalize(fieldType)}Field`] as
          | React.ComponentType<{ containerStyles?: React.CSSProperties }>
          | undefined;
        if (!FieldComponent) return null;
        return (
          <FieldComponent
            key={fieldType}
            containerStyles={{ marginBottom: "4px" }}
          />
        );
      })}
      <StandaloneButton
        paymentSession={paymentSession}
        type="pay"
        disabled={disabled}
      />
      {paymentSession.error && (
        <p style={{ color: "#c53030", margin: "4px 0 0", fontSize: "14px" }}>
          {paymentSession.error.message}
        </p>
      )}
    </div>
  );
}

// ─── Factory ──────────────────────────────────────────────────────────────────

/**
 * Returns all meta fields EXCEPT `title` for an LPM.
 *
 * Storybook's static CSF indexer requires `export default` to be a literal
 * ObjectExpression, so each story file must write its own `title` string and
 * spread the rest from this function:
 *
 * @example
 * // IdealOneTimePaymentButton.stories.tsx
 * const meta: Meta<LPMStoryArgs> = {
 *   title: "V6/LPM/iDEAL",
 *   ...createLPMMetaExtras("ideal"),
 * };
 * export default meta;
 * export const { Default, EagerOrder, WithHookPattern } = createLPMStories("ideal");
 */
export function createLPMMetaExtras(lpmKey: LPMName): Omit<Meta<LPMStoryArgs>, "title"> {
  const registry = getLPMExport<typeof import("@paypal/react-paypal-js/sdk-v6/local-payment-methods")["LPM_REGISTRY"]>(
    "LPM_REGISTRY",
  );
  const config = registry[lpmKey];
  const pascal = toPascal(lpmKey);
  const { sessionFields, component, displayName } = config;
  const argTypes = buildArgTypes(sessionFields);

  return {
    tags: ["autodocs"],
    parameters: {
      providerType: "lpm",
      lpmComponent: component,
      controls: { expanded: true },
      docs: {
        description: {
          component: `**${displayName}** one-time payment integration via the PayPal SDK.

The simplest integration uses \`${pascal}OneTimePaymentButton\` — an all-in-one component that renders
the payment fields and button internally. For full layout control, use the \`use${pascal}OneTimePaymentSession\`
hook together with the \`${pascal}PaymentButton\` standalone button: the hook returns named field components
(\`NameField\`, \`EmailField\`, etc.) that can be placed freely in your layout.

Both patterns require wrapping your app with:
\`\`\`tsx
<PayPalProvider components={["${component}"]} ... />
\`\`\`
`,
        },
        page: () => (
          <V6DocPageStructure
            code={getLPMAllInOneCode(lpmKey)}
            codeTitle="Option 1: All-in-one button (Recommended)"
            additionalExamples={[
              {
                title: "Option 2: Eager order creation",
                code: getLPMEagerOrderCode(lpmKey),
              },
              {
                title: "Option 3: Hook + standalone button pattern",
                code: getLPMHookPatternCode(lpmKey),
              },
            ]}
          />
        ),
      },
    },
    argTypes,
    decorators: [withLPMPayPalProvider],
  };
}

export interface LPMNamedStories {
  Default: StoryObj<LPMStoryArgs>;
  EagerOrder: StoryObj<LPMStoryArgs>;
  WithHookPattern: StoryObj<LPMStoryArgs>;
}

/** Returns the three named story objects for an LPM. */
export function createLPMStories(lpmKey: LPMName): LPMNamedStories {
  const registry = getLPMExport<typeof import("@paypal/react-paypal-js/sdk-v6/local-payment-methods")["LPM_REGISTRY"]>(
    "LPM_REGISTRY",
  );
  const config = registry[lpmKey];
  const pascal = toPascal(lpmKey);
  const ButtonComponent = getLPMExport<React.ComponentType<Record<string, unknown>>>(
    `${pascal}OneTimePaymentButton`,
  );

  const { sessionFields, fields } = config;
  const defaultArgs = buildDefaultArgs(sessionFields);

  const Default: StoryObj<LPMStoryArgs> = {
    name: "Default (All-in-one button)",
    render: (args) => (
      <AllInOneWrapper
        ButtonComponent={ButtonComponent}
        sessionFields={sessionFields}
        {...args}
      />
    ),
    args: defaultArgs,
  };

  const EagerOrder: StoryObj<LPMStoryArgs> = {
    name: "Eager Order Creation",
    render: (args) => (
      <EagerOrderWrapper
        ButtonComponent={ButtonComponent}
        {...args}
      />
    ),
    args: defaultArgs,
  };

  const WithHookPattern: StoryObj<LPMStoryArgs> = {
    name: "Hook + Standalone Button",
    render: (args) => (
      <HookPatternWrapper
        lpmKey={lpmKey}
        sessionFields={sessionFields}
        fields={fields}
        {...args}
      />
    ),
    args: defaultArgs,
  };

  return { Default, EagerOrder, WithHookPattern };
}
