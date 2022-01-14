import {
    validateReducer,
    validateBraintreeAuthorizationData,
} from "./contextValidator";
import { SCRIPT_LOADING_STATE } from "../types/enums";
import {
    SCRIPT_ID,
    EMPTY_BRAINTREE_AUTHORIZATION_ERROR_MESSAGE,
} from "../constants";

describe("validateReducer", () => {
    test("should throw an exception when called with no args", () => {
        expect(() => {
            validateReducer(null);
        }).toThrowError(
            new Error(
                "usePayPalScriptReducer must be used within a PayPalScriptProvider"
            )
        );
    });

    test("should throw an exception when called with an empty object", () => {
        expect(() => {
            // @ts-expect-error - improper context test
            validateReducer({});
        }).toThrowError(
            new Error(
                "usePayPalScriptReducer must be used within a PayPalScriptProvider"
            )
        );
    });

    test("should throw an exception when the dispatch function is invalid", () => {
        expect(() => {
            // @ts-expect-error - improper dispatch test
            validateReducer({ dispatch: 10 });
        }).toThrowError(
            new Error(
                "usePayPalScriptReducer must be used within a PayPalScriptProvider"
            )
        );
    });

    test("should return an exception when dispatch is a function with empty parameters", () => {
        expect(() => {
            // @ts-expect-error - improper dispatch test
            validateReducer({ dispatch: jest.fn() });
        }).toThrowError(
            new Error(
                "usePayPalScriptReducer must be used within a PayPalScriptProvider"
            )
        );
    });

    test("should return same object if dispatch is a function with one parameter", () => {
        const state = { dispatch: jest.fn((param) => param) };
        // @ts-expect-error - improper dispatch test
        expect(validateReducer(state)).toEqual(state);
    });
});

describe("validateBraintreeAuthorizationData", () => {
    const state = null;
    test("should throw an exception when called with no args", () => {
        expect(() => {
            validateBraintreeAuthorizationData(state);
        }).toThrowError(new Error(EMPTY_BRAINTREE_AUTHORIZATION_ERROR_MESSAGE));
    });

    test("should throw an exception when data-client-token is null", () => {
        const state = {
            options: {
                "data-client-token": null,
                [SCRIPT_ID]: "id",
                "client-id": "123",
            },
            loadingStatus: SCRIPT_LOADING_STATE.RESOLVED,
        };
        expect(() => {
            // @ts-expect-error - data-client-token of null not expected in types
            validateBraintreeAuthorizationData(state);
        }).toThrowError(new Error(EMPTY_BRAINTREE_AUTHORIZATION_ERROR_MESSAGE));
    });

    test("should throw an exception when data-client-token is an empty string", () => {
        const state = {
            options: {
                "data-client-token": "",
                [SCRIPT_ID]: "id",
                "client-id": "123",
            },
            loadingStatus: SCRIPT_LOADING_STATE.RESOLVED,
        };
        expect(() => {
            validateBraintreeAuthorizationData(state);
        }).toThrowError(new Error(EMPTY_BRAINTREE_AUTHORIZATION_ERROR_MESSAGE));
    });

    test("should throw an exception when data-user-id-token is an empty string", () => {
        const state = {
            options: {
                "data-user-id-token": "",
                [SCRIPT_ID]: "id",
                "client-id": "123",
            },
            loadingStatus: SCRIPT_LOADING_STATE.RESOLVED,
        };
        expect(() => {
            validateBraintreeAuthorizationData(state);
        }).toThrowError(new Error(EMPTY_BRAINTREE_AUTHORIZATION_ERROR_MESSAGE));
    });

    test("should return object if data client token is a valid string", () => {
        const state = {
            options: {
                "data-client-token": "JKHFGDHJ657",
                [SCRIPT_ID]: "id",
                "client-id": "123",
            },
            loadingStatus: SCRIPT_LOADING_STATE.RESOLVED,
        };
        expect(validateBraintreeAuthorizationData(state)).toEqual(state);
    });
});
