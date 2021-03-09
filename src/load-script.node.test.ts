/**
 * @jest-environment node
 */

import { loadScript, loadCustomScript } from "./load-script";

test("should still resolve when global window object does not exist", async () => {
    await expect(loadScript({ "client-id": "test" })).resolves.toBeNull();
    await expect(
        loadCustomScript({ url: "https://www.example.com/index.js" })
    ).resolves.toBeUndefined();
});
