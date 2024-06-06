import { renderHook } from "@testing-library/react-hooks";

import { usePayPalHostedFields } from "./payPalHostedFieldsHooks";

describe("usePayPalHostedFields", () => {
    test("should return context", () => {
        const { result } = renderHook(() => usePayPalHostedFields());

        expect(result.current).toMatchObject({});
    });
});
