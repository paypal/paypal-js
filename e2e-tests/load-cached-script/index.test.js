describe("Load cached script", () => {
    beforeEach(async () => {
        await Promise.all([
            page.goto(
                `${process.env.BASE_URL}/e2e-tests/load-cached-script/index.html`,
                {
                    waitUntil: "networkidle2",
                }
            ),
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
        expect(pageTitle).toBe("Load Cached Script | PayPal JS");
    });

    it("should not reload the script when the loadScript options have not changed", async () => {
        const scriptElement = await page.$(
            'script[src^="https://www.paypal.com/sdk/js"]'
        );
        const scriptUID = await page.evaluate(
            (el) => el.getAttribute("data-uid-auto"),
            scriptElement
        );

        const reloadButton = await page.evaluateHandle(() =>
            document.querySelector("#btn-reload")
        );
        await reloadButton.click();

        await page.waitForResponse((response) =>
            response
                .url()
                .startsWith("https://www.sandbox.paypal.com/smart/buttons")
        );

        const latestScriptElement = await page.$(
            'script[src^="https://www.paypal.com/sdk/js"]'
        );
        const latestScriptUID = await page.evaluate(
            (el) => el.getAttribute("data-uid-auto"),
            latestScriptElement
        );

        expect(latestScriptUID).toBe(scriptUID);
    });
});
