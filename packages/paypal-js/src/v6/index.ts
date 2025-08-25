import { loadCustomScript as originalLoadCustomScript } from "../load-script";

const version = "__VERSION__";

// V6-specific loadCustomScript without PromisePonyfill
function loadCustomScript(options: {
    url: string;
    attributes?: Record<string, string>;
}): Promise<void> {
    return originalLoadCustomScript(options); // Uses default Promise
}

export { loadCustomScript, version };
