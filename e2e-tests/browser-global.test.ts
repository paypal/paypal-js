import { test, expect } from "@playwright/test";
import { successfulSDKResponseMock } from "./mocks";

test("Browser global window.paypalLoadScript", async ({ page }) => {
    page.route("https://www.paypal.com/sdk/js?**", (route) =>
        route.fulfill({
            status: 200,
            body: successfulSDKResponseMock(),
        })
    );

    await page.goto("/e2e-tests/browser-global.html");

    await expect(page).toHaveTitle(
        "Demo with window.paypalLoadScript | PayPal JS"
    );

    const scriptElement = await page.locator(
        'script[src^="https://www.paypal.com/sdk/js"]'
    );
    const uidFromDOM = await scriptElement.getAttribute("data-uid-auto");

    expect(uidFromDOM).toMatch(/^\d+$/);

    const button = await page.locator(".paypal-button");
    await expect(button).toBeVisible();
});
