import { renderHook } from "@testing-library/react-hooks";

import {
    usePayPalCardFields,
    usePayPalCardFieldsSession,
} from "./usePayPalCardFields";

describe("usePayPalCardFields", () => {
    test("should throw an error when used without PayPalCardFieldsProvider", () => {
        const { result } = renderHook(() => usePayPalCardFields());

        expect(result.error).toEqual(
            new Error(
                "usePayPalCardFields must be used within a PayPalCardFieldsProvider",
            ),
        );
    });
});

describe("usePayPalCardFieldsSession", () => {
    test("should throw an error when used without PayPalCardFieldsProvider", () => {
        const { result } = renderHook(() => usePayPalCardFieldsSession());

        expect(result.error).toEqual(
            new Error(
                "usePayPalCardFieldsSession must be used within a PayPalCardFieldsProvider",
            ),
        );
    });
});
