import { LPM_REGISTRY } from "./lpmRegistry";
import { SDK_LPM_BUTTON_TAGS } from "../types/sdkWebComponents";

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

  test("every button tag is a registered SDK web component", () => {
    for (const [key, config] of Object.entries(LPM_REGISTRY)) {
      const isValid = SDK_LPM_BUTTON_TAGS.has(config.buttonTag);
      if (!isValid) {
        throw new Error(
          `"${key}" has buttonTag "${config.buttonTag}" which is not in SDK_LPM_BUTTON_TAGS`,
        );
      }
      expect(isValid).toBe(true);
    }
  });

  test("contains expected LPMs from each geographic region", () => {
    const lpmNames = Object.keys(LPM_REGISTRY);
    // Europe - Western
    expect(lpmNames).toContain("ideal");
    expect(lpmNames).toContain("bancontact");
    expect(lpmNames).toContain("eps");
    expect(lpmNames).toContain("sepa");
    // Europe - Nordic & Baltic
    expect(lpmNames).toContain("trustly");
    expect(lpmNames).toContain("swish");
    expect(lpmNames).toContain("verkkopankki");
    expect(lpmNames).toContain("klarna");
    // Europe - Central
    expect(lpmNames).toContain("blik");
    expect(lpmNames).toContain("twint");
    expect(lpmNames).toContain("p24");
    // Asia - Southeast
    expect(lpmNames).toContain("grabpay");
    expect(lpmNames).toContain("fpx");
    expect(lpmNames).toContain("gopay");
    // Asia - East
    expect(lpmNames).toContain("alipay");
    expect(lpmNames).toContain("wechatpay");
    // Americas
    expect(lpmNames).toContain("pixInternational");
    expect(lpmNames).toContain("boletobancario");
    // Oceania
    expect(lpmNames).toContain("afterpay");
    expect(lpmNames).toContain("zip");
  });

  test("FIUU has non-derived button tag (special exception)", () => {
    expect(LPM_REGISTRY.fiuu.component).toBe("fiuu-cash-payments");
    expect(LPM_REGISTRY.fiuu.buttonTag).toBe("fiuu-button");
    // Verify it does NOT follow standard derivation
    expect(LPM_REGISTRY.fiuu.component.replace("-payments", "-button")).not.toBe(
      LPM_REGISTRY.fiuu.buttonTag,
    );
  });

  test("LPMs with sessionFields have correct types", () => {
    const validSessionFieldTypes = new Set([
      "phone",
      "billingAddress",
      "taxInfo",
      "expiryDate",
      "dateOfBirth",
      "numberOfInstallments",
    ]);

    for (const [lpmKey, config] of Object.entries(LPM_REGISTRY)) {
      for (const field of config.sessionFields) {
        expect(validSessionFieldTypes.has(field)).toBe(true);
        // Verify the documented fields match registry entries
        if (lpmKey === "mbway") {
          expect(config.sessionFields).toContain("phone");
        }
        if (lpmKey === "pixInternational") {
          expect(config.sessionFields).toContain("phone");
          expect(config.sessionFields).toContain("billingAddress");
          expect(config.sessionFields).toContain("taxInfo");
        }
        if (lpmKey === "floa") {
          expect(config.sessionFields).toContain("dateOfBirth");
          expect(config.sessionFields).toContain("numberOfInstallments");
        }
      }
    }
  });
});
