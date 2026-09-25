import { test, expect } from "@playwright/test";
import { MAX_SCRIPT_LOAD_ERROR_RETRIES } from "../../src/v6/constants";

test("Reject with a descriptive error after exhausting retries (v6)", async ({
  page,
}) => {
  let requestCount = 0;

  await page.route(
    "https://www.sandbox.paypal.com/web-sdk/v6/core**",
    (route) => {
      requestCount++;

      // every attempt fails, forcing the loader to exhaust all its retries
      return route.fulfill({
        status: 500,
        body: "Internal Server Error",
      });
    },
  );

  await page.goto("/e2e-tests/v6/retry-exhausted-script.html");
  await expect(page).toHaveTitle("Retry Exhausted Script V6 | PayPal JS");

  await page.waitForFunction(
    'document.querySelector("#error-message").textContent.length > 0',
  );

  const totalAttempts = MAX_SCRIPT_LOAD_ERROR_RETRIES + 1;
  const errorMessage = await page.locator("#error-message").innerText();

  expect(errorMessage).toMatch(
    new RegExp(
      `^Error: The script "https://www\\.sandbox\\.paypal\\.com/web-sdk/v6/core" failed to load after ${totalAttempts} attempt\\(s\\) totaling \\d+ms\\. Check the HTTP status code and response body in DevTools to learn more\\.$`,
    ),
  );

  expect(requestCount).toEqual(totalAttempts);

  // no leftover script elements should remain registered as pending
  const pendingScripts = page.locator(
    'script[src*="/web-sdk/v6/core"][data-loading-state="pending"]',
  );
  await expect(pendingScripts).toHaveCount(0);
});
