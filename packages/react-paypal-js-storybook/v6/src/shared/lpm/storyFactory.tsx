/**
 * Factory that generates Storybook `meta` + the Default story for any unbranded LPM.
 *
 * Only the recommended all-in-one pattern is exposed as a live story. The eager
 * order and hook+standalone patterns are documented as code examples on the
 * autodocs page (see `createLPMMetaExtras`) rather than as separate stories.
 *
 * Usage in a story file:
 *
 *   const meta: Meta<LPMStoryArgs> = { title: "V6/LPM/iDEAL", ...createLPMMetaExtras("ideal") };
 *   export default meta;
 *   export const Default = createLPMStories("ideal").Default;
 */

import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { action } from "storybook/actions";

import * as LPMExports from "@paypal/react-paypal-js/sdk-v6/local-payment-methods";
import type { LPMName } from "@paypal/react-paypal-js/sdk-v6/local-payment-methods";

import { withLPMPayPalProvider } from "../../decorators";
import { V6DocPageStructure } from "../../components";
import { createOrder, captureOrder } from "../utils";
import { dispatchPaymentResult } from "../PaymentResult";
import {
  getLPMAllInOneCode,
  getLPMEagerOrderCode,
  getLPMHookPatternCode,
} from "./code";
import {
  presentationModeArgType,
  disabledArgType,
  buttonTypeArgType,
  lpmButtonEventArgTypes,
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
  SAMPLE_FIELD_VALUES,
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

  if (
    sessionFields.includes("phone") &&
    args.phoneCountryCode &&
    args.phoneNationalNumber
  ) {
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
  if (
    sessionFields.includes("numberOfInstallments") &&
    args.numberOfInstallments != null
  ) {
    extras.numberOfInstallments = args.numberOfInstallments;
  }

  return extras;
}

/** Builds the argTypes for a given LPM based on its required session fields. */
function buildArgTypes(sessionFields: readonly string[]) {
  const base = {
    disabled: disabledArgType,
    presentationMode: presentationModeArgType,
    type: buttonTypeArgType,
    ...lpmButtonEventArgTypes,
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
  if (
    sessionFields.includes("dateOfBirth") ||
    sessionFields.includes("numberOfInstallments")
  ) {
    Object.assign(base, floaArgTypes);
  }
  return base;
}

/** Builds the default arg values including session field defaults. */
function buildDefaultArgs(sessionFields: readonly string[]): LPMStoryArgs {
  const base: LPMStoryArgs = {
    disabled: false,
    // "popup" is the universally-supported LPM presentation mode. Some LPMs
    // (e.g. SEPA) reject "auto" at runtime with
    // "PaymentFlowError: unsupported presentationMode: auto".
    presentationMode: "popup",
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
  if (
    sessionFields.includes("dateOfBirth") ||
    sessionFields.includes("numberOfInstallments")
  ) {
    Object.assign(base, defaultFloaArgs);
  }
  return base;
}

// ─── Story wrapper components ─────────────────────────────────────────────────

type AllInOneWrapperProps = LPMStoryArgs & {
  ButtonComponent: React.ComponentType<Record<string, unknown>>;
  sessionFields: readonly string[];
};

function AllInOneWrapper({
  ButtonComponent,
  sessionFields,
  disabled,
  presentationMode,
  ...rest
}: AllInOneWrapperProps) {
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
    fieldValues: SAMPLE_FIELD_VALUES,
    type: "pay",
  });
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
 * export const Default = createLPMStories("ideal").Default;
 */
export function createLPMMetaExtras(
  lpmKey: LPMName,
): Omit<Meta<LPMStoryArgs>, "title"> {
  const registry =
    getLPMExport<
      (typeof import("@paypal/react-paypal-js/sdk-v6/local-payment-methods"))["LPM_REGISTRY"]
    >("LPM_REGISTRY");
  const config = registry[lpmKey];
  const pascal = toPascal(lpmKey);
  const { sessionFields, component, displayName, testBuyerCountry } = config;
  const argTypes = buildArgTypes(sessionFields);

  // NOTE: `tags: ["autodocs"]` is intentionally NOT returned here. Storybook's
  // static CSF indexer only detects autodocs when `tags` is a literal in the
  // story file's default export — a value spread in from this function is
  // invisible at index time, so no Docs page would be generated. Each LPM story
  // file therefore declares `tags: ["autodocs"]` as a literal (same reason the
  // `title` must be written literally per file).
  return {
    parameters: {
      providerType: "lpm",
      lpmComponent: component,
      testBuyerCountry,
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
}

/**
 * Returns the named story object(s) for an LPM. Only the recommended all-in-one
 * `Default` story is exposed; the eager and hook patterns live in the docs page.
 */
export function createLPMStories(lpmKey: LPMName): LPMNamedStories {
  const registry =
    getLPMExport<
      (typeof import("@paypal/react-paypal-js/sdk-v6/local-payment-methods"))["LPM_REGISTRY"]
    >("LPM_REGISTRY");
  const config = registry[lpmKey];
  const pascal = toPascal(lpmKey);
  const ButtonComponent = getLPMExport<
    React.ComponentType<Record<string, unknown>>
  >(`${pascal}OneTimePaymentButton`);

  const { sessionFields } = config;
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

  return { Default };
}
