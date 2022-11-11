import { test, expect } from "@playwright/test";

test("Load cached script", async ({ page }) => {
    await page.goto("/e2e-tests/load-cached-script.html", {
        waitUntil: "networkidle",
    });
    await expect(page).toHaveTitle("Load Cached Script | PayPal JS");
    await expect(page.locator("iframe.component-frame.visible")).toBeVisible();

    // should not reload the script when the loadScript options have not changed

    const scriptElement = await page.locator(
        'script[src^="https://www.paypal.com/sdk/js"]'
    );
    const scriptUID = await scriptElement.getAttribute("data-uid-auto");

    await page.locator("#btn-reload").click();

    await page.waitForResponse((response) =>
        response
            .url()
            .startsWith("https://www.sandbox.paypal.com/smart/buttons")
    );

    const latestScriptElement = await page.locator(
        'script[src^="https://www.paypal.com/sdk/js"]'
    );
    const latestScriptUID = await latestScriptElement.getAttribute(
        "data-uid-auto"
    );

    expect(latestScriptUID).toEqual(scriptUID);
});
