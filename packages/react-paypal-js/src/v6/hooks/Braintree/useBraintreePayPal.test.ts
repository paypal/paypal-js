import { renderHook } from "@testing-library/react-hooks";

import { useBraintreePayPal } from "./useBraintreePayPal";

describe("useBraintreePayPal", () => {
    test("should throw an error when used without BraintreePayPalProvider", () => {
        const { result } = renderHook(() => useBraintreePayPal());

        expect(result.error).toEqual(
            new Error(
                "useBraintreePayPal must be used within a BraintreePayPalProvider",
            ),
        );
    });
});
