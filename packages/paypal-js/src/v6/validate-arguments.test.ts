import { describe, expect, test } from "vitest";

import { validateArguments } from "./validate-arguments";

describe("validateArguments()", () => {
  test("should throw when options is not an object", () => {
    expect(() => validateArguments(123)).toThrow("Expected an options object");
    expect(() => validateArguments(null)).toThrow("Expected an options object");
  });

  test("should throw when environment is missing", () => {
    expect(() => validateArguments({})).toThrow(
      'The "environment" option is required and must be either "production" or "sandbox"',
    );
  });

  test("should throw when environment is explicitly undefined", () => {
    expect(() => validateArguments({ environment: undefined })).toThrow(
      'The "environment" option is required and must be either "production" or "sandbox"',
    );
  });

  test("should throw when environment is an invalid value", () => {
    expect(() => validateArguments({ environment: "bad_value" })).toThrow(
      'The "environment" option is required and must be either "production" or "sandbox"',
    );
  });

  test("should not throw for valid environment values", () => {
    expect(() => validateArguments({ environment: "sandbox" })).not.toThrow();
    expect(() =>
      validateArguments({ environment: "production" }),
    ).not.toThrow();
  });

  test("should throw when dataNamespace is an empty string", () => {
    expect(() =>
      validateArguments({ environment: "sandbox", dataNamespace: "" }),
    ).toThrow('The "dataNamespace" option cannot be an empty string');
  });

  test("should throw when dataNamespace is only whitespace", () => {
    expect(() =>
      validateArguments({ environment: "sandbox", dataNamespace: "   " }),
    ).toThrow('The "dataNamespace" option cannot be an empty string');
  });

  test("should not throw for a valid dataNamespace", () => {
    expect(() =>
      validateArguments({
        environment: "sandbox",
        dataNamespace: "myCustomNamespace",
      }),
    ).not.toThrow();
  });

  test("should throw when dataSdkIntegrationSource is an empty string", () => {
    expect(() =>
      validateArguments({
        environment: "sandbox",
        dataSdkIntegrationSource: "",
      }),
    ).toThrow(
      'The "dataSdkIntegrationSource" option cannot be an empty string',
    );
  });

  test("should throw when dataSdkIntegrationSource is only whitespace", () => {
    expect(() =>
      validateArguments({
        environment: "sandbox",
        dataSdkIntegrationSource: "   ",
      }),
    ).toThrow(
      'The "dataSdkIntegrationSource" option cannot be an empty string',
    );
  });

  test("should not throw for a valid dataSdkIntegrationSource", () => {
    expect(() =>
      validateArguments({
        environment: "sandbox",
        dataSdkIntegrationSource: "react-paypal-js",
      }),
    ).not.toThrow();
  });

  test("should ignore a prototype-polluted environment and still throw", () => {
    // Simulate prototype pollution: without an own-property guard, the polluted
    // value would pass validation and silently be treated as a valid environment.
    (Object.prototype as Record<string, unknown>)["environment"] = "sandbox";
    try {
      expect(() => validateArguments({})).toThrow(
        'The "environment" option is required and must be either "production" or "sandbox"',
      );
    } finally {
      delete (Object.prototype as Record<string, unknown>)["environment"];
    }
  });

  test("should ignore a prototype-polluted dataNamespace", () => {
    // Simulate prototype pollution: without an own-property guard, a caller
    // omitting `dataNamespace` would have its validation driven by the
    // attacker's value instead of treating the option as absent.
    (Object.prototype as Record<string, unknown>)["dataNamespace"] = "";
    try {
      expect(() => validateArguments({ environment: "sandbox" })).not.toThrow();
    } finally {
      delete (Object.prototype as Record<string, unknown>)["dataNamespace"];
    }
  });

  test("should ignore a prototype-polluted dataSdkIntegrationSource", () => {
    (Object.prototype as Record<string, unknown>)["dataSdkIntegrationSource"] =
      "";
    try {
      expect(() => validateArguments({ environment: "sandbox" })).not.toThrow();
    } finally {
      delete (Object.prototype as Record<string, unknown>)[
        "dataSdkIntegrationSource"
      ];
    }
  });
});
