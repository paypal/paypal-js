import { test, expect } from "@playwright/test";
import { successfulV6SDKResponseMock } from "../mocks";
import { SCRIPT_LOAD_TIMEOUT_MS } from "../../src/v6/constants";

// How long after the loader times out that the original response arrives.
const DELAYED_RESPONSE_MS = SCRIPT_LOAD_TIMEOUT_MS + 5_000;

test("Do not retry a script whose timed-out request can still execute (v6)", async ({
  page,
}) => {
  test.setTimeout(DELAYED_RESPONSE_MS + 15_000);

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

      // Delay the response past the loader timeout. Removing a script element
      // cannot cancel this request, so its body will still execute later.
      return setTimeout(() => {
        route.fulfill({ status: 200, body: responseBody });
      }, DELAYED_RESPONSE_MS);
    },
  );

  await page.goto("/e2e-tests/v6/timeout-script.html");
  await expect(page).toHaveTitle("Timeout Script V6 | PayPal JS");

  await expect(page.locator("#result")).toContainText(
    "no retry was attempted to avoid loading the SDK twice",
    {
      timeout: SCRIPT_LOAD_TIMEOUT_MS + 10_000,
    },
  );

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
      { timeout: DELAYED_RESPONSE_MS - SCRIPT_LOAD_TIMEOUT_MS + 5_000 },
    )
    .toBe(1);

  expect(requestCount).toEqual(1);
  expect(pageErrors).toEqual([]);

  const resolvedScripts = page.locator(
    'script[src*="/web-sdk/v6/core"][data-loading-state="resolved"]',
  );
  await expect(resolvedScripts).toHaveCount(1);
});
