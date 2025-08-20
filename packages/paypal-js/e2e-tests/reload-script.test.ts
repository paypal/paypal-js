import { test, expect } from "@playwright/test";
import { successfulSDKResponseMock } from "./mocks";

test("Reload script", async ({ page }) => {
    page.route("https://www.paypal.com/sdk/js?**", (route) => {
        return route.fulfill({
            status: 200,
            body: successfulSDKResponseMock(),
        });
    });

    await page.goto("/e2e-tests/reload-script.html");
    await page.locator("select#currency").selectOption("USD");

    await expect(page).toHaveTitle("Reload Script Demo | PayPal JS");

    // Wait for the request when currency is changed to EUR
    const requestPromise = page.waitForRequest(
        (request) =>
            request.url().startsWith("https://www.paypal.com/sdk/js") &&
            request.url().includes("currency=EUR"),
    );

    await page.locator("select#currency").selectOption("EUR");

    const sdkRequest = await requestPromise;
    expect(sdkRequest.url().includes("currency=EUR")).toBe(true);
});
