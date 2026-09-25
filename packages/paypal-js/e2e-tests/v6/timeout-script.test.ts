import { test, expect } from "@playwright/test";
import { successfulV6SDKResponseMock } from "../mocks";
import { SCRIPT_LOAD_TIMEOUT_MS } from "../../src/v6/constants";

// How long after the timed-out first request is abandoned that its delayed
// response is finally delivered by the mocked route.
const ABANDONED_RESPONSE_DELAY_MS = SCRIPT_LOAD_TIMEOUT_MS + 5_000;

test("Retry script after a load timeout (v6)", async ({ page }) => {
  test.setTimeout(
    SCRIPT_LOAD_TIMEOUT_MS + ABANDONED_RESPONSE_DELAY_MS + 15_000,
  );

  let requestCount = 0;
  const retryParamValues: (string | null)[] = [];

  await page.route(
    "https://www.sandbox.paypal.com/web-sdk/v6/core**",
    (route) => {
      requestCount++;

      const requestUrl = new URL(route.request().url());
      retryParamValues.push(requestUrl.searchParams.get("paypal-sdk-retry"));

      // delay the first script response by more than SCRIPT_LOAD_TIMEOUT_MS
      // to trigger a retry, then let it resolve after the retry has already
      // succeeded to confirm the abandoned response is never acted upon
      if (requestCount === 1) {
        return setTimeout(() => {
          route.fulfill({
            status: 200,
            body: successfulV6SDKResponseMock(),
          });
        }, ABANDONED_RESPONSE_DELAY_MS);
      }

      return route.fulfill({
        status: 200,
        body: successfulV6SDKResponseMock(),
      });
    },
  );

  await page.goto("/e2e-tests/v6/timeout-script.html");
  await expect(page).toHaveTitle("Timeout Script V6 | PayPal JS");

  await expect(page.locator("#result")).toHaveText("loaded", {
    timeout: SCRIPT_LOAD_TIMEOUT_MS + 10_000,
  });

  expect(requestCount).toEqual(2);
  expect(retryParamValues).toEqual([null, "1"]);

  // The timed-out script element is removed from the DOM as soon as the
  // retry is scheduled, well before its response arrives.
  const scriptLocator = page.locator(
    'script[src*="/web-sdk/v6/core"]:not([data-loading-state="resolved"])',
  );
  await expect(scriptLocator).toHaveCount(0);

  // Note: a browser has no way to cancel a <script src> request once it has
  // been sent, so the abandoned first request's body still gets evaluated
  // whenever it eventually arrives - this is a platform limitation, not
  // something the loader can prevent. What the loader *can* guarantee is
  // that it never acts on that stale response: no extra request is fired,
  // no second script element is left registered as "resolved", and the
  // already-settled result is never disturbed. Wait past the point where
  // the abandoned response is delivered and assert on exactly that.
  await page.waitForTimeout(
    ABANDONED_RESPONSE_DELAY_MS - SCRIPT_LOAD_TIMEOUT_MS + 2_000,
  );

  expect(requestCount).toEqual(2);
  await expect(page.locator("#result")).toHaveText("loaded");

  const resolvedScripts = page.locator(
    'script[src*="/web-sdk/v6/core"][data-loading-state="resolved"]',
  );
  await expect(resolvedScripts).toHaveCount(1);
});
