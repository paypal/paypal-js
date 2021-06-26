import { baseURL } from "../test-helper";

describe("Reload script", () => {
    let sdkResponse, smartButtonsResponse;

    beforeEach(async () => {
        [, sdkResponse, smartButtonsResponse] = await Promise.all([
            page.goto(`${baseURL}/e2e-tests/reload-script/index.html`, {
                waitUntil: "networkidle2",
            }),
            page.waitForResponse((response) =>
                response.url().startsWith("https://www.paypal.com/sdk/js")
            ),
            page.waitForResponse((response) =>
                response
                    .url()
                    .startsWith("https://www.sandbox.paypal.com/smart/buttons")
            ),
        ]);
    });

    it("should return the expected page <title>", async () => {
        const pageTitle = await page.title();
        expect(pageTitle).toBe("Reload Script Demo | PayPal JS");
    });

    it("should switch currency from USD to EUR", async () => {
        expect(sdkResponse.url().includes("currency=USD")).toBe(true);
        expect(smartButtonsResponse.url().includes("currency=USD")).toBe(true);

        await expect(page).toMatchElement("iframe.component-frame.visible");

        await page.select("select#currency", "EUR");
        const [sdkResponseUpdated, smartButtonsResponseUpdated] =
            await Promise.all([
                page.waitForResponse((response) =>
                    response.url().startsWith("https://www.paypal.com/sdk/js")
                ),
                page.waitForResponse((response) =>
                    response
                        .url()
                        .startsWith(
                            "https://www.sandbox.paypal.com/smart/buttons"
                        )
                ),
            ]);

        expect(sdkResponseUpdated.url().includes("currency=EUR")).toBe(true);
        expect(smartButtonsResponseUpdated.url().includes("currency=EUR")).toBe(
            true
        );
    });
});
