import { test, expect } from "@playwright/test";
import { successfulV6SDKResponseMock } from "../mocks";

test("Load cached script (v6)", async ({ page }) => {
  page.route("https://www.sandbox.paypal.com/web-sdk/v6/core**", (route) =>
    route.fulfill({
      status: 200,
      body: successfulV6SDKResponseMock(),
    }),
  );

  let sdkRequestCounter = 0;
  await page.on("request", (request) => {
    if (
      request.url().startsWith("https://www.sandbox.paypal.com/web-sdk/v6/core")
    ) {
      sdkRequestCounter++;
    }
  });

  await page.goto("/e2e-tests/v6/load-cached-script.html");
  await expect(page).toHaveTitle("Load Cached Script V6 | PayPal JS");

  // should not reload the script when the loadCoreSdkScript options have not changed
  expect(sdkRequestCounter).toEqual(1);

  await page.locator("#btn-reload").click();

  // wait 1 second
  await new Promise((resolve) => setTimeout(resolve, 1000));

  expect(sdkRequestCounter).toEqual(1);
});
