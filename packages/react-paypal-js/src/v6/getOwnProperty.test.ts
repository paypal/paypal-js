import { getOwnProperty } from "./getOwnProperty";

describe("getOwnProperty()", () => {
  afterEach(() => {
    delete (Object.prototype as Record<string, unknown>).polluted;
  });

  test("returns the value for an own property", () => {
    expect(getOwnProperty({ a: 1 }, "a")).toBe(1);
  });

  test("returns undefined for a missing own property", () => {
    expect(getOwnProperty({} as { a?: number }, "a")).toBeUndefined();
  });

  test("ignores a value inherited from a polluted Object.prototype", () => {
    (Object.prototype as Record<string, unknown>).polluted = "evil";

    expect(
      getOwnProperty({} as Record<string, unknown>, "polluted"),
    ).toBeUndefined();
  });
});
