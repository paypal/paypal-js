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
    for (const config of Object.values(LPM_REGISTRY)) {
      const expectedTag = config.component.replace("-payments", "-button");
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
