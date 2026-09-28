import { beforeEach, describe, expect, test, vi } from "vitest";

import { loadCoreSdkScript } from "./index";

describe("loadCoreSdkScript()", () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let scriptAppendChildSpy: any;

  beforeEach(() => {
    document.head.innerHTML = "";
    vi.clearAllMocks();
    vi.unstubAllGlobals();

    scriptAppendChildSpy = vi
      .spyOn(document.head, "appendChild")
      .mockImplementation((node) => {
        if (node instanceof HTMLScriptElement) {
          const namespace = node.getAttribute("data-namespace") ?? "paypal";
          vi.stubGlobal(namespace, { version: "6" });
          process.nextTick(() => node.dispatchEvent(new Event("load")));
        }
        return node;
      });
  });

  test("should load the sandbox environment when environment is 'sandbox'", async () => {
    const result = await loadCoreSdkScript({ environment: "sandbox" });
    expect(scriptAppendChildSpy).toHaveBeenCalledTimes(1);
    const scriptElement = scriptAppendChildSpy.mock.calls[0][0];
    expect(scriptElement.src).toBe(
      "https://www.sandbox.paypal.com/web-sdk/v6/core",
    );
    expect(scriptElement.getAttribute("data-loading-state")).toBe("resolved");
    expect(result).toBeDefined();
    expect(window.paypal).toBeDefined();
  });

  test("should support options for using production environment", async () => {
    const result = await loadCoreSdkScript({ environment: "production" });
    expect(scriptAppendChildSpy).toHaveBeenCalledTimes(1);
    const scriptElement = scriptAppendChildSpy.mock.calls[0][0];
    expect(scriptElement.src).toBe("https://www.paypal.com/web-sdk/v6/core");
    expect(scriptElement.getAttribute("data-loading-state")).toBe("resolved");
    expect(result).toBeDefined();
    expect(window.paypal).toBeDefined();
  });

  test("should support enabling debugging", async () => {
    const result = await loadCoreSdkScript({
      environment: "sandbox",
      debug: true,
    });
    expect(scriptAppendChildSpy).toHaveBeenCalledTimes(1);
    const scriptElement = scriptAppendChildSpy.mock.calls[0][0];
    expect(scriptElement.src).toBe(
      "https://www.sandbox.paypal.com/web-sdk/v6/core?debug=true",
    );
    expect(scriptElement.getAttribute("data-loading-state")).toBe("resolved");
    expect(result).toBeDefined();
    expect(window.paypal).toBeDefined();
  });

  test("should avoid inserting two script elements when called twice sequentially", async () => {
    const result1 = await loadCoreSdkScript({ environment: "sandbox" });
    const result2 = await loadCoreSdkScript({ environment: "sandbox" });
    // should only insert the script once
    // the existing loaded window.paypal reference is returned on the second call
    expect(scriptAppendChildSpy).toHaveBeenCalledTimes(1);
    const scriptElement = scriptAppendChildSpy.mock.calls[0][0];
    expect(scriptElement.src).toBe(
      "https://www.sandbox.paypal.com/web-sdk/v6/core",
    );
    expect(scriptElement.getAttribute("data-loading-state")).toBe("resolved");
    expect(result1).toBeDefined();
    expect(result2).toBeDefined();
    expect(result1).toBe(result2);
    expect(window.paypal).toBeDefined();
  });

  test("should avoid inserting two script elements when called twice in parallel", async () => {
    const [result1, result2] = await Promise.all([
      loadCoreSdkScript({ environment: "sandbox" }),
      loadCoreSdkScript({ environment: "sandbox" }),
    ]);
    // should only insert the script once
    expect(scriptAppendChildSpy).toHaveBeenCalledTimes(1);
    const scriptElement = scriptAppendChildSpy.mock.calls[0][0];
    expect(scriptElement.src).toBe(
      "https://www.sandbox.paypal.com/web-sdk/v6/core",
    );
    expect(scriptElement.getAttribute("data-loading-state")).toBe("resolved");
    expect(result1).toBeDefined();
    expect(result2).toBeDefined();
    expect(result1).toBe(result2);
    expect(window.paypal).toBeDefined();
  });

  test("should share a single retry chain across concurrent calls instead of inserting duplicate scripts on failure", async () => {
    let appendCount = 0;
    vi.spyOn(document.head, "appendChild").mockImplementation((node) => {
      appendCount++;
      if (appendCount === 1) {
        process.nextTick(() => node.dispatchEvent(new Event("error")));
      } else if (node instanceof HTMLScriptElement) {
        vi.stubGlobal("paypal", { version: "6" });
        process.nextTick(() => node.dispatchEvent(new Event("load")));
      }
      return node;
    });

    const [result1, result2] = await Promise.all([
      loadCoreSdkScript({ environment: "sandbox" }),
      loadCoreSdkScript({ environment: "sandbox" }),
    ]);

    // one failed attempt + one successful retry, shared by both callers
    expect(appendCount).toBe(2);
    expect(result1).toBe(result2);
    expect(window.paypal).toBeDefined();
  });

  test("should allow a fresh load attempt after retries are exhausted", async () => {
    vi.spyOn(document.head, "appendChild").mockImplementation((node) => {
      process.nextTick(() => node.dispatchEvent(new Event("error")));
      return node;
    });

    await expect(
      loadCoreSdkScript({ environment: "sandbox" }),
    ).rejects.toThrow();

    // a subsequent call must not reuse the exhausted/rejected retry chain
    const appendChildSpy = vi
      .spyOn(document.head, "appendChild")
      .mockImplementation((node) => {
        if (node instanceof HTMLScriptElement) {
          vi.stubGlobal("paypal", { version: "6" });
          process.nextTick(() => node.dispatchEvent(new Event("load")));
        }
        return node;
      });
    appendChildSpy.mockClear();

    const result = await loadCoreSdkScript({ environment: "sandbox" });
    expect(appendChildSpy).toHaveBeenCalledTimes(1);
    expect(result).toBeDefined();
  });

  test("should ignore a prototype-polluted dataNamespace and use the default", async () => {
    // Simulate prototype pollution: without an own-property guard, a caller
    // omitting `dataNamespace` would pick up the attacker's value and expose the
    // SDK under an attacker-chosen global (namespace confusion).
    (Object.prototype as Record<string, unknown>)["dataNamespace"] = "evilNs";
    try {
      const result = await loadCoreSdkScript({ environment: "sandbox" });
      expect(scriptAppendChildSpy).toHaveBeenCalledTimes(1);
      const scriptElement = scriptAppendChildSpy.mock.calls[0][0];
      expect(scriptElement.getAttribute("data-namespace")).toBe(null);
      expect(result).toBe(window.paypal);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((window as any).evilNs).toBeUndefined();
    } finally {
      delete (Object.prototype as Record<string, unknown>)["dataNamespace"];
    }
  });

  describe("dataNamespace option", () => {
    test("should support custom data-namespace attribute", async () => {
      const customNamespace = "myCustomNamespace";

      const result = await loadCoreSdkScript({
        environment: "sandbox",
        dataNamespace: customNamespace,
      });

      expect(scriptAppendChildSpy).toHaveBeenCalledTimes(1);
      const scriptElement = scriptAppendChildSpy.mock.calls[0][0];
      expect(scriptElement.src).toBe(
        "https://www.sandbox.paypal.com/web-sdk/v6/core",
      );

      expect(scriptElement.getAttribute("data-namespace")).toBe(
        customNamespace,
      );

      expect(result).toBeDefined();
      expect(customNamespace in window).toBe(true);
    });
  });

  describe("dataSdkIntegrationSource option", () => {
    test("should support custom data-sdk-integration-source attribute", async () => {
      const integrationSource = "react-paypal-js";

      const result = await loadCoreSdkScript({
        environment: "sandbox",
        dataSdkIntegrationSource: integrationSource,
      });

      expect(scriptAppendChildSpy).toHaveBeenCalledTimes(1);
      const scriptElement = scriptAppendChildSpy.mock.calls[0][0];
      expect(scriptElement.src).toBe(
        "https://www.sandbox.paypal.com/web-sdk/v6/core",
      );

      expect(scriptElement.getAttribute("data-sdk-integration-source")).toBe(
        integrationSource,
      );

      expect(result).toBeDefined();
      expect(window.paypal).toBeDefined();
    });
  });
});
