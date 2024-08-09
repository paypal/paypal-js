import { test, expect } from "@playwright/test";
import { successfulSDKResponseMock } from "./mocks";

test("Load cached script", async ({ page }) => {
    page.route("https://www.paypal.com/sdk/js?**", (route) =>
        route.fulfill({
            status: 200,
            body: successfulSDKResponseMock(),
        }),
    );

    let sdkRequestCounter = 0;
    await page.on("request", (request) => {
        if (request.url().startsWith("https://www.paypal.com/sdk/js")) {
            sdkRequestCounter++;
        }
    });

    await page.goto("/e2e-tests/load-cached-script.html");
    await expect(page).toHaveTitle("Load Cached Script | PayPal JS");

    // should not reload the script when the loadScript options have not changed
    expect(sdkRequestCounter).toEqual(1);

    await page.locator("#btn-reload").click();

    // wait 1 second
    await new Promise((resolve) => setTimeout(resolve, 1000));

    expect(sdkRequestCounter).toEqual(1);
});
