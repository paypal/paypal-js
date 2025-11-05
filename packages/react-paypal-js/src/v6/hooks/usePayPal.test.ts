import { renderHook } from "@testing-library/react-hooks";

import { usePayPal } from "./usePayPal";

describe("usePayPal", () => {
    test("should throw an error when used without PayPalProvider", () => {
        const { result } = renderHook(() => usePayPal());

        expect(result.error).toEqual(
            new Error("usePayPal must be used within a PayPalProvider"),
        );
    });
});
