describe("Validation Errors", () => {
    beforeEach(async () => {
        await page.goto(
            `${process.env.BASE_URL}/e2e-tests/loading-errors/index.html`,
            {
                waitUntil: "networkidle2",
            }
        );
    });

    it("should return the expected page <title>", async () => {
        const pageTitle = await page.title();
        expect(pageTitle).toBe("Loading Errors | PayPal JS");
    });

    it("should error when loading script without client-id", async () => {
        await page.click("#btn-load-no-client-id");

        await page.waitForResponse((response) =>
            response.url().startsWith("https://www.paypal.com/sdk/js")
        );

        await page.waitForFunction(
            'document.querySelector("#error-message").innerText.length'
        );

        const errorMessage = await page.evaluate(
            () => document.querySelector("#error-message").innerHTML
        );
        expect(errorMessage).toMatch(/Error: Expected client-id to be passed/);
    });
});
