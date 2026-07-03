/**
 * Code example factory for LPM (Local Payment Method) stories.
 *
 * Generates integration code snippets for each named LPM component,
 * covering two patterns:
 *   1. All-in-one button (`{LPM}OneTimePaymentButton`) with lazy createOrder
 *   2. Hook + standalone button pattern (fields placed anywhere in the layout)
 */

import { LPM_REGISTRY } from "@paypal/react-paypal-js/sdk-v6/local-payment-methods";
import type { LPMName } from "@paypal/react-paypal-js/sdk-v6/local-payment-methods";

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** Converts a camelCase LPM key to a PascalCase component prefix, e.g. "pixInternational" → "PixInternational" */
function toPascal(lpmKey: string): string {
  return lpmKey.charAt(0).toUpperCase() + lpmKey.slice(1);
}

function buildSessionFieldsReturnClause(sessionFields: readonly string[]): string {
  if (sessionFields.length === 0) return "";

  const lines: string[] = [];
  if (sessionFields.includes("phone")) {
    lines.push("        phone: { countryCode: \"1\", nationalNumber: \"4155552671\" },");
  }
  if (sessionFields.includes("billingAddress")) {
    lines.push(
      "        billingAddress: {",
      "            addressLine1: \"123 Main St\",",
      "            adminArea2: \"San Jose\",",
      "            adminArea1: \"CA\",",
      "            postalCode: \"95131\",",
      "            countryCode: \"US\",",
      "        },",
    );
  }
  if (sessionFields.includes("taxInfo")) {
    lines.push("        taxInfo: { taxId: \"12345678901\", taxIdType: \"BR_CPF\" },");
  }
  if (sessionFields.includes("dateOfBirth")) {
    lines.push("        dateOfBirth: \"1990-01-15\",");
  }
  if (sessionFields.includes("numberOfInstallments")) {
    lines.push("        numberOfInstallments: 3,");
  }
  if (sessionFields.includes("expiryDate")) {
    lines.push("        expiryDate: \"2025-12\",");
  }

  return lines.length ? `\n${lines.join("\n")}` : "";
}

function buildSessionFieldPropsClause(sessionFields: readonly string[]): string {
  const lines: string[] = [];
  if (sessionFields.includes("phone")) {
    lines.push("            phone={{ countryCode: \"1\", nationalNumber: \"4155552671\" }}");
  }
  if (sessionFields.includes("billingAddress")) {
    lines.push(
      "            billingAddress={{",
      "                addressLine1: \"123 Main St\",",
      "                adminArea2: \"San Jose\",",
      "                adminArea1: \"CA\",",
      "                postalCode: \"95131\",",
      "                countryCode: \"US\",",
      "            }}",
    );
  }
  if (sessionFields.includes("taxInfo")) {
    lines.push("            taxInfo={{ taxId: \"12345678901\", taxIdType: \"BR_CPF\" }}");
  }
  if (sessionFields.includes("dateOfBirth")) {
    lines.push("            dateOfBirth=\"1990-01-15\"");
  }
  if (sessionFields.includes("numberOfInstallments")) {
    lines.push("            numberOfInstallments={3}");
  }
  if (sessionFields.includes("expiryDate")) {
    lines.push("            expiryDate=\"2025-12\"");
  }
  return lines.length ? `\n${lines.join("\n")}` : "";
}

/**
 * Generates the "all-in-one button" code example for an LPM.
 * Shows the `{LPM}OneTimePaymentButton` with lazy `createOrder`.
 */
export function getLPMAllInOneCode(lpmKey: LPMName): string {
  const config = LPM_REGISTRY[lpmKey];
  const pascal = toPascal(lpmKey);
  const ButtonName = `${pascal}OneTimePaymentButton`;
  const component = config.component;
  const sessionFieldsReturn = buildSessionFieldsReturnClause(config.sessionFields);

  return `// Lazy order creation (Recommended)
// The order is created only when the buyer clicks the button.
import {
    PayPalProvider,
    ${ButtonName},
} from "@paypal/react-paypal-js/sdk-v6/local-payment-methods";

async function createOrder() {
    const response = await fetch("/api/paypal/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: [{ id: "item-1", quantity: 1 }] }),
    });
    const data = await response.json();
    return {
        orderId: data.id,${sessionFieldsReturn}
    };
}

async function onApprove(data) {
    const response = await fetch(\`/api/paypal/capture/\${data.orderId}\`, {
        method: "POST",
    });
    const result = await response.json();
    console.log("Payment captured:", result);
}

export default function App() {
    return (
        <PayPalProvider
            clientId="YOUR_CLIENT_ID"
            environment="sandbox"
            components={["${component}"]}
            pageType="checkout"
        >
            <${ButtonName}
                createOrder={createOrder}
                onApprove={onApprove}
                onCancel={(data) => console.log("Cancelled:", data)}
                onError={(error) => console.error("Error:", error)}
                presentationMode="auto"
                type="pay"
            />
        </PayPalProvider>
    );
}
`;
}

/**
 * Generates the "eager order creation" code example for an LPM.
 * Shows the `{LPM}OneTimePaymentButton` with a pre-created `orderId`.
 */
export function getLPMEagerOrderCode(lpmKey: LPMName): string {
  const config = LPM_REGISTRY[lpmKey];
  const pascal = toPascal(lpmKey);
  const ButtonName = `${pascal}OneTimePaymentButton`;
  const component = config.component;

  return `// Eager order creation
// The order is created on page load and passed directly as a prop.
import { useEffect, useState } from "react";
import {
    PayPalProvider,
    ${ButtonName},
} from "@paypal/react-paypal-js/sdk-v6/local-payment-methods";

function Checkout() {
    const [orderId, setOrderId] = useState<string | null>(null);

    useEffect(() => {
        fetch("/api/paypal/create-order", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
        })
            .then((res) => res.json())
            .then((data) => setOrderId(data.id));
    }, []);

    if (!orderId) return <div>Loading...</div>;

    return (
        <${ButtonName}
            orderId={orderId}
            onApprove={async (data) => {
                await fetch(\`/api/paypal/capture/\${data.orderId}\`, {
                    method: "POST",
                });
            }}
            onCancel={(data) => console.log("Cancelled:", data)}
            onError={(error) => console.error("Error:", error)}
            presentationMode="auto"
            type="pay"
        />
    );
}

export default function App() {
    return (
        <PayPalProvider
            clientId="YOUR_CLIENT_ID"
            environment="sandbox"
            components={["${component}"]}
            pageType="checkout"
        >
            <Checkout />
        </PayPalProvider>
    );
}
`;
}

/**
 * Generates the "hook + standalone button" code example for an LPM.
 * Shows fields placed freely in the layout, with the button as a separate component.
 */
export function getLPMHookPatternCode(lpmKey: LPMName): string {
  const config = LPM_REGISTRY[lpmKey];
  const pascal = toPascal(lpmKey);
  const HookName = `use${pascal}OneTimePaymentSession`;
  const ButtonName = `${pascal}PaymentButton`;
  const component = config.component;

  const fieldDestructures = config.fields
    .map((f) => `${capitalize(f)}Field`)
    .join(", ");
  const hasFields = config.fields.length > 0;
  const sessionFieldProps = buildSessionFieldPropsClause(config.sessionFields);

  const fieldRenders = config.fields
    .map(
      (f) =>
        `            <${capitalize(f)}Field containerStyles={{ marginBottom: "8px" }} />`,
    )
    .join("\n");

  return `// Hook + standalone button pattern
// Field components and button can be placed anywhere in your layout —
// no Provider component or subtree restriction.
import {
    PayPalProvider,
    ${HookName},
    ${ButtonName},
} from "@paypal/react-paypal-js/sdk-v6/local-payment-methods";

async function createOrder() {
    const response = await fetch("/api/paypal/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
    });
    const data = await response.json();
    return { orderId: data.id };
}

function Checkout() {
    const {${hasFields ? ` ${fieldDestructures},` : ""}
        handleClick, isPending, error,
    } = ${HookName}({
        createOrder,
        onApprove: async (data) => {
            await fetch(\`/api/paypal/capture/\${data.orderId}\`, { method: "POST" });
        },
        onCancel: (data) => console.log("Cancelled:", data),
        onError: (error) => console.error("Error:", error),
        presentationMode: "auto",${sessionFieldProps}
    });

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
${hasFields ? fieldRenders + "\n" : ""}            <${ButtonName}
                paymentSession={{ handleClick, isPending, error }}
                type="pay"
                disabled={isPending}
            />
            {error && <p style={{ color: "red" }}>{error.message}</p>}
        </div>
    );
}

export default function App() {
    return (
        <PayPalProvider
            clientId="YOUR_CLIENT_ID"
            environment="sandbox"
            components={["${component}"]}
            pageType="checkout"
        >
            <Checkout />
        </PayPalProvider>
    );
}
`;
}
