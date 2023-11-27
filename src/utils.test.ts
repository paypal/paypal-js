import { mock } from "jest-mock-extended";

import { SDK_SETTINGS } from "./constants";
import {
    generateErrorMessage,
    getPayPalWindowNamespace,
    getBraintreeWindowNamespace,
    hashStr,
} from "./utils";

import type { PayPalNamespace } from "@paypal/paypal-js";
import type { BraintreeNamespace } from "./types";

describe("generateErrorMessage", () => {
    const errorMessage =
        "Unable to render <Example /> because window.customNamespace.Example is undefined.\nTo fix the issue, add 'example' to the list of components passed to the parent PayPalScriptProvider:\n`<PayPalScriptProvider options={{ components: 'hosted-fields,example'}}>`.";
    test("sdkRequestedComponents as an array", () => {
        expect(
            generateErrorMessage({
                reactComponentName: "Example",
                sdkComponentKey: "example",
                sdkRequestedComponents: ["hosted-fields"],
                sdkDataNamespace: "customNamespace",
            })
        ).toBe(errorMessage);
    });
    test("sdkRequestedComponents as a string", () => {
        expect(
            generateErrorMessage({
                reactComponentName: "Example",
                sdkComponentKey: "example",
                sdkRequestedComponents: "hosted-fields",
                sdkDataNamespace: "customNamespace",
            })
        ).toBe(errorMessage);
    });
});

describe("getPayPalWindowNamespace", () => {
    const mockPayPalNamespace = mock<PayPalNamespace>();

    beforeAll(() => {
        window.paypal = mockPayPalNamespace;
    });

    test("should return the paypal namespace", () => {
        expect(getPayPalWindowNamespace("paypal")).toEqual(window.paypal);
    });

    test("should not found the namespace", () => {
        expect(getPayPalWindowNamespace("testNamespace")).toBeUndefined();
    });
});

describe("getBraintreeWindowNamespace", () => {
    const mockBraintreeNamespace = mock<BraintreeNamespace>();

    beforeAll(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).braintree = mockBraintreeNamespace;
    });

    test("should return the paypal namespace", () => {
        expect(getBraintreeWindowNamespace("braintree")).toEqual(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (window as any).braintree
        );
    });

    test("should not found the namespace", () => {
        expect(getBraintreeWindowNamespace("testNamespace")).toBeUndefined();
    });
});

describe("hashStr", () => {
    test("should match the hash from the argument string", () => {
        expect(hashStr("react")).toMatchInlineSnapshot(`"xxhjw"`);
        expect(hashStr("react-js.braintree")).toMatchInlineSnapshot(
            `"xxhjbzppoallaomelb"`
        );
        expect(hashStr("react-js.paypal")).toMatchInlineSnapshot(
            `"xxhjbzppiqfhtje"`
        );
        expect(hashStr("")).toMatchInlineSnapshot(`""`);
        expect(
            hashStr(
                JSON.stringify({
                    clientId:
                        "AfmdXiQAZD1rldTeFe9RNvsz8eBBG-Mltqh6h-iocQ1GUNuXIDnCie9tHcueD_NrMWB9dTlWl34xEK7V",
                    currency: "USD",
                    intent: "authorize",
                    debug: false,
                    vault: false,
                    locale: "US",
                    [SDK_SETTINGS.DATA_NAMESPACE]: "braintree",
                })
            )
        ).toMatchInlineSnapshot(
            `"iiuovjsckceqfpltierfuadvueugmwdpyghjioombfdvqayoscllfvddtjnvtfgijdxjyablkakmjjmogakewwsybbxfiiseblauicltugxfqiistfmyeomwiyrvgkaswosisqbndhwqqmmclzswdxymqeuqwetbsehtpvnvgsvtsiscvpnvvxdxekjpwoayeofhgilfeke"`
        );
    });
});
