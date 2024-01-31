import Promise from "promise-polyfill";
import {
  loadScript as originalLoadScript,
  loadCustomScript as originalLoadCustomScript,
} from "../load-script";
import type { PayPalScriptOptions } from "../../types/script-options";
import type { PayPalNamespace } from "../../types/index";

export function loadScript(
  options: PayPalScriptOptions
): Promise<PayPalNamespace | null> {
  return originalLoadScript(options, Promise);
}

export function loadCustomScript(options: {
  url: string;
  attributes?: Record<string, string>;
}): Promise<void> {
  return originalLoadCustomScript(options, Promise);
}

// replaced with the package.json version at build time
export const version = "__VERSION__";
