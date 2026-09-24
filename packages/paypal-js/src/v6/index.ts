import { getOwnProperty, isServer } from "../utils";
import type {
  PayPalV6Namespace,
  LoadCoreSdkScriptOptions,
} from "../../types/v6/index";
import { getPayPalWindowNamespace } from "./dom";
import { loadScriptWithRetry } from "./load-script-with-retry";
import { validateArguments } from "./validate-arguments";

const version = "__VERSION__";

// Callers awaiting the same namespace share one retry chain, otherwise
// concurrent calls would each independently retry the same failure and
// insert duplicate script elements.
const inFlightScriptLoads = new Map<string, Promise<PayPalV6Namespace>>();

function loadCoreSdkScript(options: LoadCoreSdkScriptOptions) {
  validateArguments(options);

  if (isServer()) {
    return Promise.resolve(null);
  }

  // Use getOwnProperty to avoid picking up prototype-polluted values.
  const environment = getOwnProperty(options, "environment");
  const debug = getOwnProperty(options, "debug");
  const dataNamespace = getOwnProperty(options, "dataNamespace");
  const dataSdkIntegrationSource = getOwnProperty(
    options,
    "dataSdkIntegrationSource",
  );
  const namespace = dataNamespace ?? "paypal";
  const paypalWindowReference = getPayPalWindowNamespace(namespace);
  if (paypalWindowReference?.version.startsWith("6")) {
    return Promise.resolve(paypalWindowReference);
  }

  const existingLoad = inFlightScriptLoads.get(namespace);
  if (existingLoad) {
    return existingLoad;
  }

  const baseURL =
    environment === "production"
      ? "https://www.paypal.com"
      : "https://www.sandbox.paypal.com";
  const url = new URL("/web-sdk/v6/core", baseURL);

  if (debug) {
    url.searchParams.append("debug", "true");
  }

  const loadPromise = loadScriptWithRetry({
    url,
    namespace,
    dataNamespace,
    dataSdkIntegrationSource,
  });
  inFlightScriptLoads.set(namespace, loadPromise);
  const clearInFlightLoad = () => {
    if (inFlightScriptLoads.get(namespace) === loadPromise) {
      inFlightScriptLoads.delete(namespace);
    }
  };
  loadPromise.then(clearInFlightLoad, clearInFlightLoad);

  return loadPromise;
}

export { loadCoreSdkScript, version };
