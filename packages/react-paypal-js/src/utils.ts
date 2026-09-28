import {
  DEFAULT_PAYPAL_NAMESPACE,
  DEFAULT_BRAINTREE_NAMESPACE,
} from "./constants";

import type { PayPalNamespace } from "@paypal/paypal-js";
import type { BraintreeNamespace } from "./types";

type ErrorMessageParams = {
  reactComponentName: string;
  sdkComponentKey: string;
  sdkRequestedComponents?: string | string[];
  sdkDataNamespace?: string;
};

/**
 * Get the namespace from the window in the browser
 * this is useful to get the paypal object from window
 * after load PayPal SDK script
 *
 * @param namespace the name space to return
 * @returns the namespace if exists or undefined otherwise
 */
export function getPayPalWindowNamespace(
  namespace: string = DEFAULT_PAYPAL_NAMESPACE,
): PayPalNamespace {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (window as any)[namespace];
}

/**
 * Get a namespace from the window in the browser
 * this is useful to get the braintree from window
 * after load Braintree script
 *
 * @param namespace the name space to return
 * @returns the namespace if exists or undefined otherwise
 */
export function getBraintreeWindowNamespace(
  namespace: string = DEFAULT_BRAINTREE_NAMESPACE,
): BraintreeNamespace {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (window as any)[namespace];
}

/**
 * Creates a string hash code based on the string argument
 *
 * @param str the source input string to hash
 * @returns string hash code
 */
export function hashStr(str: string): string {
  let hash = "";

  for (let i = 0; i < str.length; i++) {
    let total = str[i].charCodeAt(0) * i;

    if (str[i + 1]) {
      total += str[i + 1].charCodeAt(0) * (i - 1);
    }

    hash += String.fromCharCode(97 + (Math.abs(total) % 26));
  }

  return hash;
}

/**
 * Read an own property from an options object, ignoring any value inherited
 * from the prototype chain, to prevent prototype-polluted values (CWE-1321)
 * from being silently accepted when the caller's options object omits the
 * property. Local copy of the equivalent helper in @paypal/paypal-js's
 * src/utils.ts, which isn't exported from that package's public entry points.
 */
export function getOwnProperty<T extends object, K extends keyof T>(
  options: T,
  key: K,
): T[K] | undefined {
  return Object.prototype.hasOwnProperty.call(options, key)
    ? options[key]
    : undefined;
}

export function generateErrorMessage({
  reactComponentName,
  sdkComponentKey,
  sdkRequestedComponents = "",
  sdkDataNamespace = DEFAULT_PAYPAL_NAMESPACE,
}: ErrorMessageParams): string {
  const requiredOptionCapitalized = sdkComponentKey
    .charAt(0)
    .toUpperCase()
    .concat(sdkComponentKey.substring(1));
  let errorMessage = `Unable to render <${reactComponentName} /> because window.${sdkDataNamespace}.${requiredOptionCapitalized} is undefined.`;

  // The JS SDK only loads the buttons component by default.
  // All other components like messages and marks must be requested using the "components" query parameter
  const requestedComponents =
    typeof sdkRequestedComponents === "string"
      ? sdkRequestedComponents
      : sdkRequestedComponents.join(",");
  if (!requestedComponents.includes(sdkComponentKey)) {
    const expectedComponents = [requestedComponents, sdkComponentKey]
      .filter(Boolean)
      .join();

    errorMessage +=
      `\nTo fix the issue, add '${sdkComponentKey}' to the list of components passed to the parent PayPalScriptProvider:` +
      `\n\`<PayPalScriptProvider options={{ components: '${expectedComponents}'}}>\`.`;
  }

  return errorMessage;
}
