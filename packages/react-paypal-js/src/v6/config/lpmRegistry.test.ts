import { LPM_REGISTRY } from "./lpmRegistry";
import { TEST_BUYER_COUNTRY } from "./__fixtures__/testBuyerCountry";
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

  test("every entry has a sandbox test buyer country fixture", () => {
    for (const key of Object.keys(LPM_REGISTRY)) {
      expect(TEST_BUYER_COUNTRY[key as keyof typeof LPM_REGISTRY]).toMatch(
        /^[A-Z]{2}$/,
      );
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
    expect(
      LPM_REGISTRY.fiuu.component.replace("-payments", "-button"),
    ).not.toBe(LPM_REGISTRY.fiuu.buttonTag);
  });

  test("session fields match the corresponding core SDK payment sessions", () => {
    const validSessionFieldTypes = new Set([
      "phone",
      "billingAddress",
      "taxInfo",
      "expiryDate",
      "dateOfBirth",
      "numberOfInstallments",
    ]);

    const expectedSessionFields = {
      afterpay: ["billingAddress"],
      alfamart: ["phone"],
      bancomatPay: ["phone"],
      boletobancario: ["billingAddress", "taxInfo", "expiryDate"],
      doku: ["phone"],
      dragonpay: ["phone"],
      floa: ["dateOfBirth", "numberOfInstallments"],
      gopay: ["phone"],
      indomaret: ["phone"],
      indonesiaBanks: ["phone"],
      jeniuspay: ["phone"],
      klarna: ["phone", "billingAddress"],
      kredivo: ["phone"],
      linkaja: ["phone"],
      mbway: ["phone"],
      ovo: ["phone"],
      oxxopay: ["expiryDate"],
      pixInternational: ["taxInfo"],
      scalapay: ["phone"],
      zip: ["phone", "billingAddress"],
    } as const;

    for (const [lpmKey, config] of Object.entries(LPM_REGISTRY)) {
      for (const field of config.sessionFields) {
        expect(validSessionFieldTypes.has(field)).toBe(true);
      }

      expect(config.sessionFields).toEqual(
        expectedSessionFields[lpmKey as keyof typeof expectedSessionFields] ??
          [],
      );
    }
  });
});
