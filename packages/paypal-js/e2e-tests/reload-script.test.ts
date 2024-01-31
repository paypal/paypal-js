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

  let sdkRequest;
  await page.on("request", (request) => {
    if (request.url().startsWith("https://www.paypal.com/sdk/js")) {
      sdkRequest = request.url();
    }
  });

  await page.locator("select#currency").selectOption("EUR");
  expect(sdkRequest.includes("currency=EUR")).toBe(true);
});
