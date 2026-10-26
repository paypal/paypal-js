import type { PayPalV6Namespace } from "../../types/v6/index";

export function getPayPalWindowNamespace(
  namespace: string,
): PayPalV6Namespace | undefined {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const paypalWindowReference = (window as any)[namespace];

  // Ignore anything that is not the v6 SDK, such as a v5 SDK that is
  // already loaded on the same namespace.
  if (
    typeof paypalWindowReference?.version !== "string" ||
    !paypalWindowReference.version.startsWith("6")
  ) {
    return undefined;
  }

  return paypalWindowReference;
}

export function createScriptElement({
  url,
  attributes,
}: {
  url: string;
  attributes: Record<string, string | undefined>;
}) {
  const newScript = document.createElement("script");
  newScript.src = url;

  for (const [key, value] of Object.entries(attributes)) {
    if (value !== undefined) {
      newScript.setAttribute(key, value);
    }
  }

  document.head.appendChild(newScript);
  return newScript;
}
