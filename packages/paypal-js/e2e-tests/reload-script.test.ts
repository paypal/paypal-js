import { test, expect } from "@playwright/test";
import { successfulSDKResponseMock } from "./mocks";

test("Reload script", async ({ page }) => {
    // Set up request tracking BEFORE any navigation
    let sdkRequest: string | undefined;

    page.on("request", (request) => {
        if (request.url().startsWith("https://www.paypal.com/sdk/js")) {
            sdkRequest = request.url();
        }
    });

    // Set up route mocking
    await page.route("https://www.paypal.com/sdk/js?**", (route) => {
        return route.fulfill({
            status: 200,
            body: successfulSDKResponseMock(),
        });
    });

    await page.goto("/e2e-tests/reload-script.html");
    await page.locator("select#currency").selectOption("USD");

    await expect(page).toHaveTitle("Reload Script Demo | PayPal JS");

    // Clear the previous request capture before testing EUR
    sdkRequest = undefined;

    await page.locator("select#currency").selectOption("EUR");

    // Wait for the request to be captured with a timeout
    await expect(async () => {
        expect(sdkRequest).toBeDefined();
        expect(sdkRequest!.includes("currency=EUR")).toBe(true);
    }).toPass({ timeout: 5000 });
});
