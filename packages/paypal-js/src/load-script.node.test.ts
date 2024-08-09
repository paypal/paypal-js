// @vitest-environment node

import { test, expect } from "vitest";

import { loadScript, loadCustomScript } from "./load-script";

test("should still resolve when global window object does not exist", async () => {
    await expect(loadScript({ clientId: "test" })).resolves.toBeNull();
    await expect(
        loadCustomScript({ url: "https://www.example.com/index.js" }),
    ).resolves.toBeUndefined();
});
