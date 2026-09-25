import { beforeEach, describe, expect, test, vi } from "vitest";

import {
  MAX_SCRIPT_LOAD_ERROR_RETRIES,
  MAX_SCRIPT_LOAD_TIMEOUT_RETRIES,
  RETRY_BASE_DELAY_MS,
  RETRY_MAX_DELAY_MS,
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

// Mirrors the (jitter-free) retry delay calculation in load-script-with-retry.ts,
// so tests can assert on an exact expected duration once Math.random is mocked to 0.
function expectedRetryDelayMs(retryCount: number): number {
  return Math.min(
    RETRY_BASE_DELAY_MS * 2 ** (retryCount - 1),
    RETRY_MAX_DELAY_MS,
  );
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
    vi.spyOn(Math, "random").mockReturnValue(0);
    const appendChildSpy = vi
      .spyOn(document.head, "appendChild")
      .mockImplementation((node) => {
        process.nextTick(() => node.dispatchEvent(new Event("error")));
        return node;
      });

    const retryDelaysMs = Array.from(
      { length: MAX_SCRIPT_LOAD_ERROR_RETRIES },
      (_, index) => expectedRetryDelayMs(index + 1),
    );
    const totalDurationMs = retryDelaysMs.reduce(
      (sum, delay) => sum + delay,
      0,
    );

    vi.useFakeTimers();
    try {
      const loadPromise = loadScriptWithRetry(buildParams());
      const expectation = expect(loadPromise).rejects.toThrow(
        `The script "${SCRIPT_URL}" failed to load after ${
          MAX_SCRIPT_LOAD_ERROR_RETRIES + 1
        } attempt(s) totaling ${totalDurationMs}ms. Check the HTTP status code and response body in DevTools to learn more.`,
      );

      for (const delay of retryDelaysMs) {
        await vi.advanceTimersByTimeAsync(delay);
      }

      await expectation;
      // 1 initial attempt + MAX_SCRIPT_LOAD_ERROR_RETRIES retries
      expect(appendChildSpy).toHaveBeenCalledTimes(
        MAX_SCRIPT_LOAD_ERROR_RETRIES + 1,
      );
    } finally {
      vi.useRealTimers();
    }
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

  test("should resolve with the window namespace instead of retrying if it becomes available before the retry fires", async () => {
    vi.spyOn(Math, "random").mockReturnValue(0);
    const appendChildSpy = vi
      .spyOn(document.head, "appendChild")
      .mockImplementation((node) => {
        process.nextTick(() => node.dispatchEvent(new Event("error")));
        return node;
      });

    vi.useFakeTimers();
    try {
      const loadPromise = loadScriptWithRetry(buildParams());

      // the first attempt errors, scheduling a retry; before that retry
      // fires, something else (e.g. a concurrent load) sets the namespace
      await vi.advanceTimersByTimeAsync(0);
      vi.stubGlobal("paypal", { version: "6" });

      await vi.advanceTimersByTimeAsync(expectedRetryDelayMs(1));

      const result = await loadPromise;
      expect(result).toBe(window.paypal);
      expect(appendChildSpy).toHaveBeenCalledTimes(1);
    } finally {
      vi.useRealTimers();
    }
  });

  test("should reject after exhausting timeout retries without waiting for error retries", async () => {
    vi.spyOn(Math, "random").mockReturnValue(0);
    let attempts = 0;
    vi.spyOn(document.head, "appendChild").mockImplementation((node) => {
      attempts++;
      // never fires load or error, only ever times out
      return node;
    });

    const retryDelaysMs = Array.from(
      { length: MAX_SCRIPT_LOAD_TIMEOUT_RETRIES },
      (_, index) => expectedRetryDelayMs(index + 1),
    );
    const totalDurationMs =
      SCRIPT_LOAD_TIMEOUT_MS * (MAX_SCRIPT_LOAD_TIMEOUT_RETRIES + 1) +
      retryDelaysMs.reduce((sum, delay) => sum + delay, 0);

    vi.useFakeTimers();
    try {
      const loadPromise = loadScriptWithRetry(buildParams());
      const expectation = expect(loadPromise).rejects.toThrow(
        `The script "${SCRIPT_URL}" timed out after ${
          MAX_SCRIPT_LOAD_TIMEOUT_RETRIES + 1
        } attempt(s) totaling ${totalDurationMs}ms, exceeding the ${SCRIPT_LOAD_TIMEOUT_MS}ms timeout on the final attempt.`,
      );

      for (const delay of retryDelaysMs) {
        await vi.advanceTimersByTimeAsync(SCRIPT_LOAD_TIMEOUT_MS);
        await vi.advanceTimersByTimeAsync(delay);
      }
      // final attempt times out with no further retry scheduled
      await vi.advanceTimersByTimeAsync(SCRIPT_LOAD_TIMEOUT_MS);

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
