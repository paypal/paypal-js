import { test, expect } from "@playwright/test";
import { successfulV6SDKResponseMock } from "../mocks";

test("Retry script (v6)", async ({ page }) => {
  let requestCount = 0;
  const retryParamValues: (string | null)[] = [];

  await page.route(
    "https://www.sandbox.paypal.com/web-sdk/v6/core**",
    (route) => {
      requestCount++;

      const requestUrl = new URL(route.request().url());
      retryParamValues.push(requestUrl.searchParams.get("paypal-sdk-retry"));

      // fail the first two attempts, succeed on the third
      if (requestCount < 3) {
        return route.fulfill({
          status: 500,
          body: "Internal Server Error",
        });
      }

      return route.fulfill({
        status: 200,
        body: successfulV6SDKResponseMock(),
      });
    },
  );

  await page.goto("/e2e-tests/v6/retry-script.html");
  await expect(page).toHaveTitle("Retry Script V6 | PayPal JS");

  await expect(page.locator("#result")).toHaveText("loaded");

  expect(requestCount).toEqual(3);
  expect(retryParamValues).toEqual([null, "1", "2"]);
});
