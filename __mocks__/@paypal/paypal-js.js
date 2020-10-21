import { loadScript as loadScriptOriginal } from "@paypal/paypal-js";

export function loadScript(options) {
    let scriptSrc;

    // JSDOM does not support the HTMLScriptElement onload() callback since it doesn't actually load external scripts
    // this code fakes the script onload() behavior by calling it whenever script.src property is set
    Object.defineProperty(HTMLScriptElement.prototype, "src", {
        get: jest.fn(() => scriptSrc),
        set: jest.fn(function (src) {
            scriptSrc = src;
            setTimeout(() => {
                window.paypal = window.paypal || {};
                if (this.onload) this.onload();
            });
        }),
    });

    return new Promise((resolve) => {
        loadScriptOriginal(options);
        setTimeout(() => resolve({}));
    });
}
