/**
 * Code generators for LPM (Local Payment Method) Storybook stories.
 * Each function returns a complete, copy-paste-ready code example.
 */

import { LPM_REGISTRY } from "@paypal/react-paypal-js/sdk-v6";
import type { LPMName } from "@paypal/react-paypal-js/sdk-v6";

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Country codes for testBuyerCountry — one representative country per LPM
export const LPM_COUNTRY_MAP: Record<LPMName, string> = {
  ideal: "NL",
  bancontact: "BE",
  eps: "AT",
  blik: "PL",
  mybank: "IT",
  trustly: "SE",
  p24: "PL",
  multibanco: "PT",
  bizum: "ES",
  swish: "SE",
  klarna: "SE",
  twint: "CH",
  wechatpay: "CN",
  afterpay: "AU",
  oxxopay: "MX",
  boletobancario: "BR",
  verkkopankki: "FI",
  payu: "PL",
  paysafecard: "AT",
  mbway: "PT",
  satispay: "IT",
  wero: "DE",
  floa: "FR",
  scalapay: "IT",
  grabpay: "SG",
  pixInternational: "BR",
  sepa: "DE",
  crypto: "US",
  doku: "ID",
  dragonpay: "PH",
  estonia: "EE",
  fpx: "MY",
  gopay: "ID",
  alipay: "CN",
  indomaret: "ID",
  indonesiaBanks: "ID",
  kredivo: "ID",
  linkaja: "ID",
  ovo: "ID",
  paysera: "LT",
  skrill: "AT",
  thailandBanks: "TH",
  blikPayLater: "PL",
  alfamart: "ID",
  zip: "AU",
  bancomatPay: "IT",
  latviaBanks: "LV",
  fiuu: "MY",
  lithuaniaBanks: "LT",
  jeniuspay: "ID",
};

// ─── Named Component (Recommended) ──────────────────────────────────────────

export function getLPMNamedButtonCode(lpm: LPMName): string {
  const config = LPM_REGISTRY[lpm];
  const exportName = `${capitalize(lpm)}OneTimePaymentButton`;
  const country = LPM_COUNTRY_MAP[lpm];

  return `import { PayPalProvider, ${exportName} } from "@paypal/react-paypal-js/sdk-v6";

async function createOrder() {
    const response = await fetch("/api/orders", { method: "POST" });
    const data = await response.json();
    return { orderId: data.orderId };
}

async function onApprove(data) {
    await fetch(\`/api/orders/\${data.orderId}/capture\`, { method: "POST" });
    console.log("Payment captured:", data.orderId);
}

export default function App() {
    return (
        <PayPalProvider
            clientToken="YOUR_CLIENT_TOKEN"
            components={["${config.component}"]}
            pageType="checkout"
        >
            <${exportName}
                presentationMode="popup"
                testBuyerCountry="${country}"
                createOrder={createOrder}
                onApprove={onApprove}
                onCancel={(data) => console.log("Cancelled:", data)}
                onError={(error) => console.error("Error:", error)}
            />
        </PayPalProvider>
    );
}`;
}

// ─── Generic Component ───────────────────────────────────────────────────────

export function getLPMGenericButtonCode(lpm: LPMName): string {
  const config = LPM_REGISTRY[lpm];
  const country = LPM_COUNTRY_MAP[lpm];

  return `import { PayPalProvider, LPMOneTimePaymentButton } from "@paypal/react-paypal-js/sdk-v6";

async function createOrder() {
    const response = await fetch("/api/orders", { method: "POST" });
    const data = await response.json();
    return { orderId: data.orderId };
}

export default function App() {
    return (
        <PayPalProvider
            clientToken="YOUR_CLIENT_TOKEN"
            components={["${config.component}"]}
            pageType="checkout"
        >
            <LPMOneTimePaymentButton
                lpm="${lpm}"
                presentationMode="popup"
                testBuyerCountry="${country}"
                createOrder={createOrder}
                onApprove={async (data) => {
                    await fetch(\`/api/orders/\${data.orderId}/capture\`, { method: "POST" });
                }}
                onCancel={(data) => console.log("Cancelled:", data)}
                onError={(error) => console.error("Error:", error)}
            />
        </PayPalProvider>
    );
}`;
}

// ─── Hook with Payment Fields ────────────────────────────────────────────────

export function getLPMHookCode(lpm: LPMName): string {
  const config = LPM_REGISTRY[lpm];
  const hookName = `use${capitalize(lpm)}OneTimePaymentSession`;
  const buttonName = `${capitalize(lpm)}PaymentButton`;
  const country = LPM_COUNTRY_MAP[lpm];
  const componentId = config.displayName.replace(/[^a-zA-Z0-9]/g, "");

  // e.g. ["name"] → ["NameField"], ["name", "email"] → ["NameField", "EmailField"]
  const fieldComponentNames = config.fields.map((f) => `${capitalize(f)}Field`);

  // Destructuring line — only include field names if there are any
  const destructure =
    fieldComponentNames.length > 0
      ? `const { ${fieldComponentNames.join(", ")}, isPending, error } = ${hookName}Session;`
      : `const { isPending, error } = ${hookName}Session;`;

  // Billing section — render field components returned by the hook
  const billingSection =
    fieldComponentNames.length > 0
      ? `
            {/* Secure iframe fields — returned directly by the hook, no Provider needed */}
            <section className="billing">
${fieldComponentNames.map((f) => `                <${f} containerStyles={{ marginBottom: 8 }} />`).join("\n")}
            </section>
`
      : `
`;

  return `import { PayPalProvider, ${hookName}, ${buttonName} } from "@paypal/react-paypal-js/sdk-v6";

function ${componentId}Payment() {
    // The hook returns field components (e.g. NameField) pre-bound to this session.
    // The button is imported separately and receives the full session as a prop —
    // both can live anywhere in your component tree with no Provider restriction.
    const ${hookName}Session = ${hookName}({
        presentationMode: "popup",
        testBuyerCountry: "${country}",
        createOrder: async () => {
            const res = await fetch("/api/orders", { method: "POST" });
            return res.json(); // { orderId: "..." }
        },
        onApprove: async (data) => {
            await fetch(\`/api/orders/\${data.orderId}/capture\`, { method: "POST" });
            console.log("Payment captured:", data.orderId);
        },
        onCancel: () => console.log("Payment cancelled"),
        onError: (err) => console.error("Payment error:", err),
    });

    ${destructure}

    return (
        <div>${billingSection}            {/* Button receives the session as a prop — place it anywhere */}
            <footer>
                <${buttonName} paymentSession={${hookName}Session} type="pay" />
            </footer>
            {error && <p style={{ color: "red" }}>{error.message}</p>}
        </div>
    );
}

export default function App() {
    return (
        <PayPalProvider
            clientToken="YOUR_CLIENT_TOKEN"
            components={["${config.component}"]}
            pageType="checkout"
        >
            <${componentId}Payment />
        </PayPalProvider>
    );
}`;
}
