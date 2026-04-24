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

  test("should default to using the sandbox environment", async () => {
    const result = await loadCoreSdkScript();
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
    const result = await loadCoreSdkScript({ debug: true });
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
    const result1 = await loadCoreSdkScript();
    const result2 = await loadCoreSdkScript();
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
      loadCoreSdkScript(),
      loadCoreSdkScript(),
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

  test("should return reference to existing script when loading state is pending", async () => {
    document.head.innerHTML = `<script src="https://www.sandbox.paypal.com/web-sdk/v6/core" data-loading-state="pending"></script>`;
    const loadCoreSdkScriptReference = loadCoreSdkScript();

    process.nextTick(() => {
      vi.stubGlobal("paypal", { version: "6" });
      document
        .querySelector('script[src*="/web-sdk/v6/core"]')!
        .dispatchEvent(new Event("load"));
    });

    const result = await loadCoreSdkScriptReference;

    // should NOT insert the script since it already exists in the DOM in pending state
    expect(scriptAppendChildSpy).toHaveBeenCalledTimes(0);
    expect(
      document
        .querySelector('script[src*="/web-sdk/v6/core"]')!
        .getAttribute("data-loading-state"),
    ).toBe("resolved");
    expect(result).toBeDefined();
    expect(window.paypal).toBeDefined();
  });

  test("should reject when the script fails to load", async () => {
    vi.spyOn(document.head, "appendChild").mockImplementationOnce((node) => {
      process.nextTick(() => node.dispatchEvent(new Event("error")));
      return node;
    });

    expect(async () => {
      await loadCoreSdkScript();
    }).rejects.toThrowError(
      'The script "https://www.sandbox.paypal.com/web-sdk/v6/core" failed to load. Check the HTTP status code and response body in DevTools to learn more.',
    );
  });

  test("should error due to unvalid input", async () => {
    expect(async () => {
      // @ts-expect-error invalid arguments
      await loadCoreSdkScript(123);
    }).rejects.toThrowError("Expected an options object");

    expect(async () => {
      // @ts-expect-error invalid arguments
      await loadCoreSdkScript({ environment: "bad_value" });
    }).rejects.toThrowError(
      'The "environment" option must be either "production" or "sandbox"',
    );
  });

  describe("dataNamespace option", () => {
    test("should support custom data-namespace attribute", async () => {
      const customNamespace = "myCustomNamespace";

      const result = await loadCoreSdkScript({
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(window[customNamespace as any]).toBeDefined();
    });

    test("should error when dataNamespace is an empty string", async () => {
      expect(async () => {
        await loadCoreSdkScript({ dataNamespace: "" });
      }).rejects.toThrowError(
        'The "dataNamespace" option cannot be an empty string',
      );
    });

    test("should error when dataNamespace is only whitespace", async () => {
      expect(async () => {
        await loadCoreSdkScript({ dataNamespace: "   " });
      }).rejects.toThrowError(
        'The "dataNamespace" option cannot be an empty string',
      );
    });
  });

  describe("dataSdkIntegrationSource option", () => {
    test("should support custom data-sdk-integration-source attribute", async () => {
      const integrationSource = "react-paypal-js";

      const result = await loadCoreSdkScript({
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

    test("should error when dataSdkIntegrationSource is an empty string", async () => {
      expect(async () => {
        await loadCoreSdkScript({ dataSdkIntegrationSource: "" });
      }).rejects.toThrowError(
        'The "dataSdkIntegrationSource" option cannot be an empty string',
      );
    });

    test("should error when dataSdkIntegrationSource is only whitespace", async () => {
      expect(async () => {
        await loadCoreSdkScript({ dataSdkIntegrationSource: "   " });
      }).rejects.toThrowError(
        'The "dataSdkIntegrationSource" option cannot be an empty string',
      );
    });
  });
});
