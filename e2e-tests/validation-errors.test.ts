import { test, expect } from "@playwright/test";
import { validationErrorSDKResponseMock } from "./mocks";

test("Validation errors", async ({ page }) => {
    page.route("https://www.paypal.com/sdk/js**", (route) =>
        route.fulfill({
            status: 400,
            body: validationErrorSDKResponseMock(),
        }),
    );

    await page.goto("/e2e-tests/validation-errors.html");
    await expect(page).toHaveTitle("Validation Errors | PayPal JS");
    await page.locator("#btn-load-no-client-id").click();

    await page.waitForResponse((response) =>
        response.url().startsWith("https://www.paypal.com/sdk/js"),
    );

    await page.waitForFunction(
        'document.querySelector("#error-message").innerText.length',
    );

    const errorMessage = await page.locator("#error-message").innerText();
    expect(errorMessage).toMatch(/Error: Expected client-id to be passed/);
});
