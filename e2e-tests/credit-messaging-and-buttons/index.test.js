import { baseURL } from '../test-helper';

describe('Credit Messaging and Buttons', () => {
    beforeEach(async () => {
        await Promise.all([
            page.goto(`${baseURL}/e2e-tests/credit-messaging-and-buttons/index.html`, {waitUntil: 'networkidle2'}),
            page.waitForResponse(response => response.url().startsWith('https://www.paypal.com/sdk/js'))
        ]);
    });

    it('should return the expected page <title>', async () => {
        const pageTitle = await page.title();
        expect(pageTitle).toBe('Demo using both Credit Messaging and Buttons | PayPal JS');
    });

    it('should display both the credit message component and the buttons component', async () => {
        await expect(page).toMatchElement('#messages iframe');
        await expect(page).toMatchElement('#buttons iframe');
    });
});
