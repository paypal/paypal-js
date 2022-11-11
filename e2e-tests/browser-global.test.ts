import { test, expect } from "@playwright/test";

test("Browser global window.paypalLoadScript", async ({ page }) => {
    await page.goto("/e2e-tests/browser-global.html", {
        waitUntil: "networkidle",
    });
    await expect(page).toHaveTitle(
        "Demo with window.paypalLoadScript | PayPal JS"
    );
    await expect(page.locator("iframe.component-frame.visible")).toBeVisible();
});
