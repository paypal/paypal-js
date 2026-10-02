import { test, expect } from "@playwright/test";
import { successfulV6SDKResponseMock } from "../mocks";
import { SCRIPT_LOAD_TIMEOUT_MS } from "../../src/v6/constants";

const SLOW_RESPONSE_MS = 20_000;

test("Wait for a slow script without starting a second request (v6)", async ({
  page,
}) => {
  test.setTimeout(SLOW_RESPONSE_MS + 15_000);

  let requestCount = 0;
  const retryParamValues: (string | null)[] = [];
  const pageErrors: string[] = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));

  const responseBody = `
    window.__paypalSdkExecutions = (window.__paypalSdkExecutions ?? 0) + 1;
    customElements.define(
      "paypal-timeout-regression-element",
      class extends HTMLElement {},
    );
    ${successfulV6SDKResponseMock()}
  `;

  await page.route(
    "https://www.sandbox.paypal.com/web-sdk/v6/core**",
    (route) => {
      requestCount++;

      const requestUrl = new URL(route.request().url());
      retryParamValues.push(requestUrl.searchParams.get("paypal-sdk-retry"));

      // Delay the response past the previous 15-second timeout. The loader
      // should keep waiting for this request instead of starting a retry.
      return setTimeout(() => {
        route.fulfill({ status: 200, body: responseBody });
      }, SLOW_RESPONSE_MS);
    },
  );

  await page.goto("/e2e-tests/v6/timeout-script.html");
  await expect(page).toHaveTitle("Timeout Script V6 | PayPal JS");

  await expect(page.locator("#result")).toHaveText("loaded", {
    timeout: SCRIPT_LOAD_TIMEOUT_MS,
  });

  expect(requestCount).toEqual(1);
  expect(retryParamValues).toEqual([null]);

  // Wait for the delayed response body to execute. The side effect models the
  // real Core SDK's custom-element registrations: evaluating two copies would
  // throw a duplicate custom-element DOMException.
  await expect
    .poll(
      () =>
        page.evaluate(
          () =>
            (
              window as Window & {
                __paypalSdkExecutions?: number;
              }
            ).__paypalSdkExecutions,
        ),
      { timeout: 5_000 },
    )
    .toBe(1);

  expect(requestCount).toEqual(1);
  expect(pageErrors).toEqual([]);

  const resolvedScripts = page.locator(
    'script[src*="/web-sdk/v6/core"][data-loading-state="resolved"]',
  );
  await expect(resolvedScripts).toHaveCount(1);
});

test("Reject after 30 seconds when the script never loads (v6)", async ({
  page,
}) => {
  test.setTimeout(SCRIPT_LOAD_TIMEOUT_MS + 15_000);

  let requestCount = 0;
  const retryParamValues: (string | null)[] = [];
  const pageErrors: string[] = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));

  await page.route(
    "https://www.sandbox.paypal.com/web-sdk/v6/core**",
    (route) => {
      requestCount++;

      const requestUrl = new URL(route.request().url());
      retryParamValues.push(requestUrl.searchParams.get("paypal-sdk-retry"));

      // Intentionally leave the request pending so neither a successful load
      // event nor an explicit error event is dispatched before the timeout.
    },
  );

  const startTime = Date.now();
  await page.goto("/e2e-tests/v6/timeout-script.html", {
    waitUntil: "domcontentloaded",
  });
  await expect(page).toHaveTitle("Timeout Script V6 | PayPal JS");

  await expect(page.locator("#result")).toContainText(
    `timed out after ${SCRIPT_LOAD_TIMEOUT_MS}ms on attempt 1`,
    { timeout: SCRIPT_LOAD_TIMEOUT_MS + 5_000 },
  );

  expect(Date.now() - startTime).toBeGreaterThanOrEqual(SCRIPT_LOAD_TIMEOUT_MS);
  expect(requestCount).toEqual(1);
  expect(retryParamValues).toEqual([null]);
  expect(pageErrors).toEqual([]);

  const pendingScripts = page.locator(
    'script[src*="/web-sdk/v6/core"][data-loading-state="pending"]',
  );
  await expect(pendingScripts).toHaveCount(1);
});
