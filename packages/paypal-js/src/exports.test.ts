import { readFileSync } from "fs";

import { describe, test, expect } from "vitest";

// Read + parse instead of importing package.json so this stays valid under
// the tsconfig (no resolveJsonModule) and matches the bundle tests' use of fs.
const pkg = JSON.parse(readFileSync("package.json", "utf8")) as {
  exports: Record<string, Record<string, string>>;
};

describe("package.json exports", () => {
  // The "./sdk-v6" subpath must declare a "default" condition as a terminal
  // fallback. Without it, tracers/bundlers (e.g. @vercel/nft) can mis-resolve
  // the subpath and fall back to the v5 entry. See issue #979.
  test('"./sdk-v6" declares a default condition', () => {
    expect(pkg.exports["./sdk-v6"]).toHaveProperty("default");
  });
});
