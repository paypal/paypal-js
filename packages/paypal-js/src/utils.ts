import type { PayPalScriptOptions } from "../types/script-options";

interface PayPalScriptOptionsWithStringIndex
  extends
    PayPalScriptOptions,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Record<string, any> {}

type StringMap = Record<string, string>;

export function findScript(
  url: string,
  attributes?: StringMap,
): HTMLScriptElement | null {
  const currentScript = document.querySelector<HTMLScriptElement>(
    `script[src="${url}"]`,
  );
  if (currentScript === null) return null;

  const nextScript = createScriptElement(url, attributes);

  // ignore the data-uid-auto attribute that gets auto-assigned to every script tag
  const currentScriptClone = currentScript.cloneNode() as HTMLScriptElement;
  delete currentScriptClone.dataset.uidAuto;

  // check if the new script has the same number of data attributes
  if (
    Object.keys(currentScriptClone.dataset).length !==
    Object.keys(nextScript.dataset).length
  ) {
    return null;
  }

  let isExactMatch = true;

  // check if the data attribute values are the same
  Object.keys(currentScriptClone.dataset).forEach((key) => {
    if (currentScriptClone.dataset[key] !== nextScript.dataset[key]) {
      isExactMatch = false;
    }
  });

  return isExactMatch ? currentScript : null;
}

export interface ScriptElement {
  url: string;
  attributes?: StringMap;
  onSuccess: () => void;
  onError: OnErrorEventHandler;
}

export function insertScriptElement({
  url,
  attributes,
  onSuccess,
  onError,
}: ScriptElement): void {
  const newScript = createScriptElement(url, attributes);
  newScript.onerror = onError;
  newScript.onload = onSuccess;

  document.head.insertBefore(newScript, document.head.firstElementChild);
}

export function processOptions(options: PayPalScriptOptions): {
  url: string;
  attributes: StringMap;
} {
  // Use getOwnProperty to avoid picking up prototype-polluted values.
  const customSdkBaseUrl = getOwnProperty(options, "sdkBaseUrl");
  const environment = getOwnProperty(options, "environment");

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { environment: _env, sdkBaseUrl: _, ...rest } = options;
  const sdkBaseUrl = customSdkBaseUrl || processSdkBaseUrl(environment);

  const optionsWithStringIndex = rest as PayPalScriptOptionsWithStringIndex;

  const { queryParams, attributes } = Object.keys(optionsWithStringIndex)
    .filter((key) => {
      return (
        typeof optionsWithStringIndex[key] !== "undefined" &&
        optionsWithStringIndex[key] !== null &&
        optionsWithStringIndex[key] !== ""
      );
    })
    .reduce(
      (accumulator, key) => {
        const value = optionsWithStringIndex[key].toString();
        key = camelCaseToKebabCase(key);

        if (key.substring(0, 4) === "data" || key === "crossorigin") {
          accumulator.attributes[key] = value;
        } else {
          accumulator.queryParams[key] = value;
        }
        return accumulator;
      },
      {
        queryParams: {} as StringMap,
        attributes: {} as StringMap,
      },
    );

  const merchantId = getOwnProperty(queryParams, "merchant-id");

  if (merchantId && merchantId.indexOf(",") !== -1) {
    attributes["data-merchant-id"] = merchantId;
    queryParams["merchant-id"] = "*";
  }

  return {
    url: `${sdkBaseUrl}?${objectToQueryString(queryParams)}`,
    attributes,
  };
}

export function camelCaseToKebabCase(str: string): string {
  const replacer = (match: string, indexOfMatch?: number) =>
    (indexOfMatch ? "-" : "") + match.toLowerCase();
  return str.replace(/[A-Z]+(?![a-z])|[A-Z]/g, replacer);
}

export function objectToQueryString(params: StringMap): string {
  let queryString = "";

  Object.keys(params).forEach((key) => {
    if (queryString.length !== 0) queryString += "&";
    queryString += key + "=" + params[key];
  });
  return queryString;
}

export function processSdkBaseUrl(
  environment: PayPalScriptOptions["environment"],
): string {
  // Keeping production as default to maintain backward compatibility.
  // In the future this logic needs to be changed to use sandbox domain as default instead of production.
  return environment === "sandbox"
    ? "https://www.sandbox.paypal.com/sdk/js"
    : "https://www.paypal.com/sdk/js";
}

function createScriptElement(
  url: string,
  attributes: StringMap = {},
): HTMLScriptElement {
  const newScript: HTMLScriptElement = document.createElement("script");
  newScript.src = url;

  Object.keys(attributes).forEach((key) => {
    newScript.setAttribute(key, attributes[key]);

    if (key === "data-csp-nonce") {
      newScript.setAttribute("nonce", attributes["data-csp-nonce"]);
    }
  });

  return newScript;
}

export function isServer(): boolean {
  return typeof window === "undefined" && typeof document === "undefined";
}

/**
 * Read an own property from an options object, ignoring any value inherited
 * from the prototype chain. This prevents prototype-polluted values (e.g. a
 * malicious `Object.prototype.environment`) from being silently accepted when
 * the caller's own options object omits the property (CWE-1321).
 */
export function getOwnProperty<T extends object, K extends keyof T>(
  options: T,
  key: K,
): T[K] | undefined {
  return Object.prototype.hasOwnProperty.call(options, key)
    ? options[key]
    : undefined;
}
