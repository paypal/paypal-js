import { beforeEach, describe, expect, test, vi } from "vitest";

import { createScriptElement, getPayPalWindowNamespace } from "./dom";

describe("getPayPalWindowNamespace()", () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  test("should return undefined when the namespace is not set on window", () => {
    expect(getPayPalWindowNamespace("paypal")).toBeUndefined();
  });

  test("should return the value at window[namespace]", () => {
    const reference = { version: "6" };
    vi.stubGlobal("paypal", reference);
    expect(getPayPalWindowNamespace("paypal")).toBe(reference);
  });

  test("should support custom namespaces", () => {
    const reference = { version: "6" };
    vi.stubGlobal("myCustomNamespace", reference);
    expect(getPayPalWindowNamespace("myCustomNamespace")).toBe(reference);
  });
});

describe("createScriptElement()", () => {
  beforeEach(() => {
    document.head.innerHTML = "";
  });

  test("should create a script element with the given src", () => {
    const scriptElement = createScriptElement({
      url: "https://www.sandbox.paypal.com/web-sdk/v6/core",
      attributes: {},
    });

    expect(scriptElement.tagName).toBe("SCRIPT");
    expect(scriptElement.src).toBe(
      "https://www.sandbox.paypal.com/web-sdk/v6/core",
    );
  });

  test("should append the script element to document.head", () => {
    const scriptElement = createScriptElement({
      url: "https://www.sandbox.paypal.com/web-sdk/v6/core",
      attributes: {},
    });

    expect(document.head.contains(scriptElement)).toBe(true);
  });

  test("should set the provided attributes on the script element", () => {
    const scriptElement = createScriptElement({
      url: "https://www.sandbox.paypal.com/web-sdk/v6/core",
      attributes: {
        "data-namespace": "myCustomNamespace",
        "data-loading-state": "pending",
      },
    });

    expect(scriptElement.getAttribute("data-namespace")).toBe(
      "myCustomNamespace",
    );
    expect(scriptElement.getAttribute("data-loading-state")).toBe("pending");
  });

  test("should skip attributes with an undefined value", () => {
    const scriptElement = createScriptElement({
      url: "https://www.sandbox.paypal.com/web-sdk/v6/core",
      attributes: {
        "data-namespace": undefined,
        "data-sdk-integration-source": undefined,
      },
    });

    expect(scriptElement.hasAttribute("data-namespace")).toBe(false);
    expect(scriptElement.hasAttribute("data-sdk-integration-source")).toBe(
      false,
    );
  });
});
