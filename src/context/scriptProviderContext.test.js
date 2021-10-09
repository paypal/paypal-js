import {
    getScriptID,
    destroySDKScript,
    scriptReducer,
} from "./scriptProviderContext.ts";
import { SCRIPT_ID } from "../constants";
import { DISPATCH_ACTION } from "../types/enums";

describe("getScriptID", () => {
    test("should return simple hash using empty options object", () => {
        expect(getScriptID({})).toEqual("react-paypal-js-vv");
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
    let state = {};

    beforeEach(() => {
        state = {
            buttons: {
                render: jest.fn(),
            },
            hostedFields: {
                render: jest.fn(),
            },
            FUNDING: {
                card: "CARD",
                credit: "CREDIT",
                venmo: "VENMO",
            },
            options: {
                [SCRIPT_ID]: "script",
            },
        };
    });

    test("should return same state", () => {
        expect(scriptReducer(state, { type: "" })).toMatchObject(state);
    });

    test("should add loadingStatus to the previous state", () => {
        expect(
            scriptReducer(state, {
                type: DISPATCH_ACTION.LOADING_STATUS,
                value: "resolve",
            })
        ).toMatchObject({ ...state, loadingStatus: "resolve" });
    });

    test("should reset loadingStatus to pending and options", () => {
        expect(
            scriptReducer(state, {
                type: DISPATCH_ACTION.RESET_OPTIONS,
                value: { [SCRIPT_ID]: "script" },
            })
        ).toMatchObject({
            ...state,
            loadingStatus: "pending",
            options: {
                [SCRIPT_ID]: "react-paypal-js-vv",
            },
        });
    });

    test("should set the Braintree instance", () => {
        const braintreeMockInstance = { render: jest.fn(), close: jest.fn() };

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
