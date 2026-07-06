import { LPM_REGISTRY } from "./lpmRegistry";

describe("LPM_REGISTRY", () => {
  test("every entry has required fields", () => {
    for (const [key, config] of Object.entries(LPM_REGISTRY)) {
      expect(config.component).toMatch(/-payments$/);
      expect(config.buttonTag).toMatch(/-button$/);
      expect(config.sessionMethod).toMatch(
        /^create[A-Z]\w+OneTimePaymentSession$/,
      );
      expect(config.displayName).toBeTruthy();
      expect(config.testBuyerCountry).toMatch(/^[A-Z]{2}$/);
      expect(typeof key).toBe("string");
    }
  });

  test("button tag derives from component name", () => {
    // FIUU is the one exception: its SDK component is "fiuu-cash-payments" but
    // the registered custom-element button tag is "fiuu-button".
    const TAG_EXCEPTIONS: Record<string, string> = {
      "fiuu-cash-payments": "fiuu-button",
    };
    for (const config of Object.values(LPM_REGISTRY)) {
      const expectedTag =
        TAG_EXCEPTIONS[config.component] ??
        config.component.replace("-payments", "-button");
      expect(config.buttonTag).toBe(expectedTag);
    }
  });

  test("contains expected LPMs", () => {
    const lpmNames = Object.keys(LPM_REGISTRY);
    expect(lpmNames).toContain("ideal");
    expect(lpmNames).toContain("bancontact");
    expect(lpmNames).toContain("eps");
    expect(lpmNames).toContain("blik");
  });
});
