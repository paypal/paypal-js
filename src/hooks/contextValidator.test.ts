import {
    contextNotEmptyValidator,
    contextOptionClientTokenNotEmptyValidator,
} from "./contextValidator";
import { SCRIPT_LOADING_STATE } from "../types/enums";
import { SCRIPT_ID } from "../constants";

describe("contextNotEmptyValidator", () => {
    test("should throw an exception when called with no args", () => {
        expect(() => {
            contextNotEmptyValidator(null);
        }).toThrowError(
            new Error(
                "usePayPalScriptReducer must be used within a PayPalScriptProvider"
            )
        );
    });

    test("should throw an exception when called with an empty object", () => {
        expect(() => {
            // @ts-expect-error - improper context test
            contextNotEmptyValidator({});
        }).toThrowError(
            new Error(
                "usePayPalScriptReducer must be used within a PayPalScriptProvider"
            )
        );
    });

    test("should throw an exception when the dispatch function is invalid", () => {
        expect(() => {
            // @ts-expect-error - improper dispatch test
            contextNotEmptyValidator({ dispatch: 10 });
        }).toThrowError(
            new Error(
                "usePayPalScriptReducer must be used within a PayPalScriptProvider"
            )
        );
    });

    test("should return an exception when dispatch is a function with empty parameters", () => {
        expect(() => {
            // @ts-expect-error - improper dispatch test
            contextNotEmptyValidator({ dispatch: jest.fn() });
        }).toThrowError(
            new Error(
                "usePayPalScriptReducer must be used within a PayPalScriptProvider"
            )
        );
    });

    test("should return same object if dispatch is a function with one parameter", () => {
        const state = { dispatch: jest.fn((param) => param) };
        // @ts-expect-error - improper dispatch test
        expect(contextNotEmptyValidator(state)).toEqual(state);
    });
});

describe("contextOptionClientTokenNotEmptyValidator", () => {
    const state = null;
    test("should throw an exception when called with no args", () => {
        expect(() => {
            contextOptionClientTokenNotEmptyValidator(state);
        }).toThrowError(
            new Error(
                "A client token wasn't found in the provider parent component"
            )
        );
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
            contextOptionClientTokenNotEmptyValidator(state);
        }).toThrowError(
            new Error(
                "A client token wasn't found in the provider parent component"
            )
        );
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
            contextOptionClientTokenNotEmptyValidator(state);
        }).toThrowError(
            new Error(
                "A client token wasn't found in the provider parent component"
            )
        );
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
        expect(contextOptionClientTokenNotEmptyValidator(state)).toEqual(state);
    });
});
