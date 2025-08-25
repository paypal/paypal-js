import { loadCustomScript as originalLoadCustomScript } from "../load-script";

export const version = "__VERSION__";

// V6-specific loadCustomScript without PromisePonyfill
export function loadCustomScript(options: {
    url: string;
    attributes?: Record<string, string>;
}): Promise<void> {
    return originalLoadCustomScript(options); // Uses default Promise
}
