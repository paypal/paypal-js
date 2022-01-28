import { mock } from "jest-mock-extended";

import {
    getScriptID,
    destroySDKScript,
    scriptReducer,
} from "./scriptProviderContext";
import { SCRIPT_ID } from "../constants";
import { DISPATCH_ACTION, SCRIPT_LOADING_STATE } from "../types/enums";

import type { PayPalScriptOptions } from "@paypal/paypal-js";
import type { ScriptContextState } from "./../types/scriptProviderTypes";
import type { BraintreePayPalCheckout } from "./../types/braintree/paypalCheckout";

const scriptHash = "react-paypal-js-iiuovjsqddgsesvd";

describe("getScriptID", () => {
    test("should return simple hash using empty options object", () => {
        expect(getScriptID({ "client-id": "" })).toEqual(scriptHash);
    });

    test("should return complex hash using real options object", () => {
        expect(
            getScriptID({
                "client-id": "client_id",
                intent: "capture",
                currency: "USD",
                "data-client-token": "long_JWT_client_token",
            })
        ).toEqual(
            "react-paypal-js-iiuovjsqddgsesiwxtaovtcisqugvdioamddcabdxpishjiubldxsiumrlgisobrphthbvwsdpvtdrsiuglhfrekoctjrzqiltjzdlqca"
        );
    });
});

describe("destroySDKScript", () => {
    beforeEach(() => {
        while (document.body.firstChild) {
            document.body.firstChild.remove();
        }
    });

    test("should don't do anything if the node not exists in the DOM", () => {
        const script = document.createElement("script");
        script.setAttribute("id", "script-id");

        document.body.append(script);
        destroySDKScript("script-id");

        expect(
            document.querySelector("#script-id") instanceof HTMLScriptElement
        ).toBeTruthy();
    });

    test("should remove script from the DOM", () => {
        const script = document.createElement("script");
        script.setAttribute("id", "script-id");
        script.setAttribute(`${SCRIPT_ID}`, "generated-id");

        document.body.append(script);
        destroySDKScript("generated-id");

        expect(
            document.querySelector("#script-id") instanceof HTMLScriptElement
        ).toBeFalsy();
    });
});

describe("scriptReducer", () => {
    let state: ScriptContextState;

    beforeEach(() => {
        state = {
            loadingStatus: "" as SCRIPT_LOADING_STATE,
            options: {
                "client-id": "",
                [SCRIPT_ID]: "script",
            },
        };
    });

    test("should return same state", () => {
        // @ts-expect-error type not valid
        expect(scriptReducer(state, { type: "" })).toMatchObject(state);
    });

    test("should add loadingStatus to the previous state", () => {
        expect(
            scriptReducer(state, {
                type: DISPATCH_ACTION.LOADING_STATUS,
                value: "resolve" as SCRIPT_LOADING_STATE,
            })
        ).toMatchObject({ ...state, loadingStatus: "resolve" });
    });

    test("should reset loadingStatus to pending and options", () => {
        expect(
            scriptReducer(state, {
                type: DISPATCH_ACTION.RESET_OPTIONS,
                value: {
                    "client-id": "",
                    [SCRIPT_ID]: "script",
                } as PayPalScriptOptions,
            })
        ).toMatchObject({
            ...state,
            loadingStatus: "pending",
            options: {
                [SCRIPT_ID]: scriptHash,
            },
        });
    });

    test("should set the Braintree instance", () => {
        const braintreeMockInstance = mock<BraintreePayPalCheckout>();

        expect(
            scriptReducer(state, {
                type: DISPATCH_ACTION.SET_BRAINTREE_INSTANCE,
                value: braintreeMockInstance,
            })
        ).toMatchObject({
            ...state,
            braintreePayPalCheckoutInstance: braintreeMockInstance,
        });
    });
});
