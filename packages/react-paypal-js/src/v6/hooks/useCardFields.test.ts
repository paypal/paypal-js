import { renderHook } from "@testing-library/react-hooks";

import { useCardFields, useCardFieldsSession } from "./useCardFields";

describe("useCardFields", () => {
    test("should throw an error when used without CardFieldsProvider", () => {
        const { result } = renderHook(() => useCardFields());

        expect(result.error).toEqual(
            new Error("useCardFields must be used within a CardFieldsProvider"),
        );
    });
});

describe("useCardFieldsSession", () => {
    test("should throw an error when used without CardFieldsProvider", () => {
        const { result } = renderHook(() => useCardFieldsSession());

        expect(result.error).toEqual(
            new Error(
                "useCardFieldsSession must be used within a CardFieldsProvider",
            ),
        );
    });
});
