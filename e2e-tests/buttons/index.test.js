import { baseURL } from '../test-helper';

describe('Buttons Component', () => {
    beforeEach(async () => {
        await Promise.all([
            page.goto(`${baseURL}/e2e-tests/buttons/index.html`, {waitUntil: 'networkidle2'}),
            page.waitForResponse(response => response.url().startsWith('https://www.paypal.com/sdk/js'))
        ]);
    });

    it('should return the expected page <title>', async () => {
        const pageTitle = await page.title();
        expect(pageTitle).toBe('Buttons Demo | PayPal JS');
    });

    it('should load the js sdk version 5.x.x', async () => {
        const paypalVersion = await page.evaluate(() => {
            return new Promise(resolve => {
                const interval = window.setInterval(() => {
                    if (typeof window.paypal === "object") {
                        window.clearInterval(interval);
                        resolve(window.paypal.version);
                    }
                }, 100);
            });
        });

        expect(paypalVersion.startsWith('5')).toBe(true);
    });

    it('the script should have the data-order-id attribute', async () => {
        const orderId = await page.$eval('head script', element => element.getAttribute('data-order-id'));
        expect(orderId).toBe('12345');
    });

    it('should display the inline form when clicking the "Debit or Credit Card" button', async () => {
        await expect(page).toMatchElement('iframe.component-frame.visible');

        const iframe = page.mainFrame().childFrames()[0];
        const payWithCardButton = await iframe.waitForSelector('[data-funding-source="card"]');

        await payWithCardButton.click();

        await page.mainFrame().waitForFunction(() => document.querySelector('.paypal-buttons').offsetHeight > 600);
    });
});
