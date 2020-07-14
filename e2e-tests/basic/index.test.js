import { baseURL } from '../test-helper'

describe('Basic Demo', () => {
  beforeEach(async () => {
    await Promise.all([
        page.goto(`${baseURL}/e2e-tests/basic/index.html`),
        page.waitForResponse(response => response.url().startsWith('https://www.paypal.com/sdk/js'))
    ])
  })

  it('should return the expected page <title>', async () => {
    const pageTitle = await page.title();
    expect(pageTitle).toBe('Basic Demo | PayPal JS');
  })

  it('should load the js sdk version 5.x.x', async () => {

    const version = await page.evaluate(() => {
        return window.paypal.version;
      });

    expect(version.startsWith('5')).toBe(true);
  })


  it('should display the inline form when clicking the "Debit or Credit Card" button', async () => {
    await expect(page).toMatchElement('iframe.component-frame.visible')

    const iframe = page.mainFrame().childFrames()[0];
    const payWithCardButton = await iframe.waitForSelector('[data-funding-source="card"]')

    await payWithCardButton.click()

    await page.mainFrame().waitForFunction(() => document.querySelector('.paypal-buttons').offsetHeight > 600);
  })
})
