import { test, expect } from "@playwright/test";

test("Validation errors", async ({ page }) => {
    await page.goto("/e2e-tests/validation-errors.html", {
        waitUntil: "networkidle",
    });
    await expect(page).toHaveTitle("Validation Errors | PayPal JS");
    await page.locator("#btn-load-no-client-id").click();

    await page.waitForResponse((response) =>
        response.url().startsWith("https://www.paypal.com/sdk/js")
    );

    await page.waitForFunction(
        'document.querySelector("#error-message").innerText.length'
    );

    const errorMessage = await page.locator("#error-message").innerText();
    expect(errorMessage).toMatch(/Error: Expected client-id to be passed/);
});
