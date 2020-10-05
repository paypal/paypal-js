import { loadScript as loadScriptOriginal } from "@paypal/paypal-js";

export function loadScript(options) {
    return new Promise((resolve) => {
        loadScriptOriginal(options);
        process.nextTick(() => resolve({}));
    });
}
