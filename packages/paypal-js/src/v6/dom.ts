import type { PayPalV6Namespace } from "../../types/v6/index";

export function getPayPalWindowNamespace(
  namespace: string,
): PayPalV6Namespace | undefined {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (window as any)[namespace];
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
