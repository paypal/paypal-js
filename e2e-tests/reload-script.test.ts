import { test, expect } from "@playwright/test";

test("Reload script", async ({ page }) => {
    await page.goto("/e2e-tests/reload-script.html", {
        waitUntil: "networkidle",
    });
    await expect(page).toHaveTitle("Reload Script Demo | PayPal JS");
    await expect(page.locator("iframe.component-frame.visible")).toBeVisible();

    await page.locator("select#currency").selectOption("EUR");
    const [sdkResponseUpdated, smartButtonsResponseUpdated] = await Promise.all(
        [
            page.waitForResponse((response) =>
                response.url().startsWith("https://www.paypal.com/sdk/js")
            ),
            page.waitForResponse((response) =>
                response
                    .url()
                    .startsWith("https://www.sandbox.paypal.com/smart/buttons")
            ),
        ]
    );

    expect(sdkResponseUpdated.url().includes("currency=EUR")).toBe(true);
    expect(smartButtonsResponseUpdated.url().includes("currency=EUR")).toBe(
        true
    );
});
