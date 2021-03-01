import Promise from "promise-polyfill";
import { loadScript as originalLoadScript } from "../load-script";
import type { PayPalScriptOptions } from "../../types/script-options";
import type { PayPalNamespace } from "../../types/index";

type PromiseResults = Promise<PayPalNamespace | null>;

export function loadScript(options: PayPalScriptOptions): PromiseResults {
    return originalLoadScript(options, Promise);
}

// replaced with the package.json version at build time
export const version = "__VERSION__";
