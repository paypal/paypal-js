import { renderHook } from "@testing-library/react-hooks";

import { useCardFields } from "./useCardFields";

describe("useCardFields", () => {
    test("should throw an error when used without CardFieldsProvider", () => {
        const { result } = renderHook(() => useCardFields());

        expect(result.error).toEqual(
            new Error("useCardFields must be used within a CardFieldsProvider"),
        );
    });
});
