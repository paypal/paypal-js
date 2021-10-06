import {
    contextNotEmptyValidator,
    contextOptionClientTokenNotEmptyValidator,
} from "./contextValidator";

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
            contextNotEmptyValidator({} as never);
        }).toThrowError(
            new Error(
                "usePayPalScriptReducer must be used within a PayPalScriptProvider"
            )
        );
    });

    test("should throw an exception when the dispatch function is invalid", () => {
        expect(() => {
            contextNotEmptyValidator({ dispatch: 10 } as never);
        }).toThrowError(
            new Error(
                "usePayPalScriptReducer must be used within a PayPalScriptProvider"
            )
        );
    });

    test("should return an exception when dispatch is a function with empty parameters", () => {
        expect(() => {
            contextNotEmptyValidator({ dispatch: jest.fn() } as never);
        }).toThrowError(
            new Error(
                "usePayPalScriptReducer must be used within a PayPalScriptProvider"
            )
        );
    });

    test("should return same object if dispatch is a function with one parameter", () => {
        const state = { dispatch: jest.fn((param) => param) };
        expect(contextNotEmptyValidator(state as never)).toEqual(state);
    });
});

describe("contextOptionClientTokenNotEmptyValidator", () => {
    test("should throw an exception when called with no args", () => {
        expect(() => {
            contextOptionClientTokenNotEmptyValidator(null);
        }).toThrowError(
            new Error(
                "A client token wasn't found in the provider parent component"
            )
        );
    });

    test("should throw an exception when called with an empty object", () => {
        expect(() => {
            contextOptionClientTokenNotEmptyValidator({} as never);
        }).toThrowError(
            new Error(
                "A client token wasn't found in the provider parent component"
            )
        );
    });

    test("should throw an exception when data-client-token is null", () => {
        expect(() => {
            contextOptionClientTokenNotEmptyValidator({
                options: { "data-client-token": null },
            } as never);
        }).toThrowError(
            new Error(
                "A client token wasn't found in the provider parent component"
            )
        );
    });

    test("should throw an exception when data-client-token is an empty string", () => {
        expect(() => {
            contextOptionClientTokenNotEmptyValidator({
                options: { "data-client-token": "" },
            } as never);
        }).toThrowError(
            new Error(
                "A client token wasn't found in the provider parent component"
            )
        );
    });

    test("should return object if data client token is a valid string", () => {
        const state = { options: { "data-client-token": "JKHFGDHJ657" } };
        expect(
            contextOptionClientTokenNotEmptyValidator(state as never)
        ).toEqual(state);
    });
});
