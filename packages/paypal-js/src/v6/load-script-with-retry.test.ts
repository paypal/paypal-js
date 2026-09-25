import { beforeEach, describe, expect, test, vi } from "vitest";

import {
  MAX_SCRIPT_LOAD_ERROR_RETRIES,
  MAX_SCRIPT_LOAD_TIMEOUT_RETRIES,
  SCRIPT_LOAD_TIMEOUT_MS,
} from "./constants";
import { loadScriptWithRetry } from "./load-script-with-retry";

const SCRIPT_URL = "https://www.sandbox.paypal.com/web-sdk/v6/core";

function buildParams(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    url: new URL(SCRIPT_URL),
    namespace: "paypal",
    dataNamespace: undefined,
    dataSdkIntegrationSource: undefined,
    ...overrides,
  };
}

describe("loadScriptWithRetry()", () => {
  beforeEach(() => {
    document.head.innerHTML = "";
    vi.clearAllMocks();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  test("should resolve with the window namespace reference once the script loads", async () => {
    vi.spyOn(document.head, "appendChild").mockImplementation((node) => {
      vi.stubGlobal("paypal", { version: "6" });
      process.nextTick(() => node.dispatchEvent(new Event("load")));
      return node;
    });

    const result = await loadScriptWithRetry(buildParams());

    expect(result).toBe(window.paypal);
  });

  test("should reject when the window namespace is not available after the load event", async () => {
    vi.spyOn(document.head, "appendChild").mockImplementation((node) => {
      process.nextTick(() => node.dispatchEvent(new Event("load")));
      return node;
    });

    await expect(loadScriptWithRetry(buildParams())).rejects.toBe(
      "The window.paypal global variable is not available",
    );
  });

  test("should reuse an existing pending script element instead of inserting a new one", async () => {
    document.head.innerHTML = `<script src="${SCRIPT_URL}" data-loading-state="pending"></script>`;
    const appendChildSpy = vi.spyOn(document.head, "appendChild");

    process.nextTick(() => {
      vi.stubGlobal("paypal", { version: "6" });
      document
        .querySelector('script[src*="/web-sdk/v6/core"]')!
        .dispatchEvent(new Event("load"));
    });

    const result = await loadScriptWithRetry(buildParams());

    expect(appendChildSpy).not.toHaveBeenCalled();
    expect(result).toBeDefined();
  });

  test("should append a cache-busting query param on retry attempts", async () => {
    const scriptElements: HTMLScriptElement[] = [];
    vi.spyOn(document.head, "appendChild").mockImplementation((node) => {
      if (node instanceof HTMLScriptElement) {
        scriptElements.push(node);
        if (scriptElements.length < 2) {
          process.nextTick(() => node.dispatchEvent(new Event("error")));
        } else {
          vi.stubGlobal("paypal", { version: "6" });
          process.nextTick(() => node.dispatchEvent(new Event("load")));
        }
      }
      return node;
    });

    await loadScriptWithRetry(buildParams());

    expect(scriptElements).toHaveLength(2);
    expect(scriptElements[0].src).toBe(SCRIPT_URL);
    expect(scriptElements[1].src).toBe(`${SCRIPT_URL}?paypal-sdk-retry=1`);
  });

  test("should remove the failed script element from the DOM before retrying", async () => {
    let attempts = 0;
    vi.spyOn(document.head, "appendChild").mockImplementation((node) => {
      attempts++;
      // actually attach the node so we can observe its removal on failure
      Element.prototype.appendChild.call(document.head, node);
      if (attempts < 2) {
        process.nextTick(() => node.dispatchEvent(new Event("error")));
      } else if (node instanceof HTMLScriptElement) {
        vi.stubGlobal("paypal", { version: "6" });
        process.nextTick(() => node.dispatchEvent(new Event("load")));
      }
      return node;
    });

    await loadScriptWithRetry(buildParams());

    // only the successful (second) script should remain in the document
    const remainingScripts = document.querySelectorAll(
      'script[src*="/web-sdk/v6/core"]',
    );
    expect(remainingScripts).toHaveLength(1);
    expect(remainingScripts[0].getAttribute("data-loading-state")).toBe(
      "resolved",
    );
  });

  test("should retry loading the script and resolve if a later attempt succeeds", async () => {
    let attempts = 0;
    vi.spyOn(document.head, "appendChild").mockImplementation((node) => {
      attempts++;
      if (attempts < 3) {
        process.nextTick(() => node.dispatchEvent(new Event("error")));
      } else if (node instanceof HTMLScriptElement) {
        vi.stubGlobal("paypal", { version: "6" });
        process.nextTick(() => node.dispatchEvent(new Event("load")));
      }
      return node;
    });

    const result = await loadScriptWithRetry(buildParams());

    expect(attempts).toBe(3);
    expect(result).toBeDefined();
  });

  test("should reject after exhausting all retries", async () => {
    const appendChildSpy = vi
      .spyOn(document.head, "appendChild")
      .mockImplementation((node) => {
        process.nextTick(() => node.dispatchEvent(new Event("error")));
        return node;
      });

    await expect(loadScriptWithRetry(buildParams())).rejects.toThrow(
      `The script "${SCRIPT_URL}" failed to load after ${
        MAX_SCRIPT_LOAD_ERROR_RETRIES + 1
      } attempts. Check the HTTP status code and response body in DevTools to learn more.`,
    );
    // 1 initial attempt + MAX_SCRIPT_LOAD_ERROR_RETRIES retries
    expect(appendChildSpy).toHaveBeenCalledTimes(
      MAX_SCRIPT_LOAD_ERROR_RETRIES + 1,
    );
  });

  test("should retry when the script neither loads nor errors within the timeout", async () => {
    let attempts = 0;
    vi.spyOn(document.head, "appendChild").mockImplementation((node) => {
      attempts++;
      if (attempts >= 2 && node instanceof HTMLScriptElement) {
        vi.stubGlobal("paypal", { version: "6" });
        process.nextTick(() => node.dispatchEvent(new Event("load")));
      }
      // the first attempt's script never fires load or error
      return node;
    });

    vi.useFakeTimers();
    try {
      const loadPromise = loadScriptWithRetry(buildParams());

      await vi.advanceTimersByTimeAsync(SCRIPT_LOAD_TIMEOUT_MS);
      await vi.advanceTimersByTimeAsync(1_000);

      const result = await loadPromise;
      expect(attempts).toBe(2);
      expect(result).toBeDefined();
    } finally {
      vi.useRealTimers();
    }
  });

  test("should reject after exhausting timeout retries without waiting for error retries", async () => {
    let attempts = 0;
    vi.spyOn(document.head, "appendChild").mockImplementation((node) => {
      attempts++;
      // never fires load or error, only ever times out
      return node;
    });

    vi.useFakeTimers();
    try {
      const loadPromise = loadScriptWithRetry(buildParams());
      const expectation = expect(loadPromise).rejects.toThrow(
        `The script "${SCRIPT_URL}" timed out after ${
          MAX_SCRIPT_LOAD_TIMEOUT_RETRIES + 1
        } attempts.`,
      );

      for (let i = 0; i <= MAX_SCRIPT_LOAD_TIMEOUT_RETRIES; i++) {
        await vi.advanceTimersByTimeAsync(SCRIPT_LOAD_TIMEOUT_MS);
        await vi.advanceTimersByTimeAsync(1_000);
      }

      await expectation;
      // 1 initial attempt + MAX_SCRIPT_LOAD_TIMEOUT_RETRIES retries, well
      // short of MAX_SCRIPT_LOAD_ERROR_RETRIES which only applies to error retries
      expect(attempts).toBe(MAX_SCRIPT_LOAD_TIMEOUT_RETRIES + 1);
      expect(attempts).toBeLessThan(MAX_SCRIPT_LOAD_ERROR_RETRIES + 1);
    } finally {
      vi.useRealTimers();
    }
  });
});
