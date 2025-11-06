import { renderHook } from "@testing-library/react-hooks";

import { useIsMountedRef } from "./useIsMounted";

describe("useIsMountedRef", () => {
    it("should return true if the component is still mounted", () => {
        const { result } = renderHook(() => useIsMountedRef());

        expect(result.current.current).toBe(true);
    });

    it("should return false if the component has unmounted", () => {
        const { result, unmount } = renderHook(() => useIsMountedRef());

        unmount();

        expect(result.current.current).toBe(false);
    });
});
