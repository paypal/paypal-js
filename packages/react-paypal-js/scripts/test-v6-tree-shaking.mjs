#!/usr/bin/env node

import { rollup } from "rollup";

import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const packageDirectory = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const packageJsonPath = resolve(packageDirectory, "package.json");
const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8"));
const v6ClientExport = packageJson.exports["./sdk-v6"];
const v6ServerExport = packageJson.exports["./sdk-v6/server"];
const v6ClientPath = resolve(packageDirectory, v6ClientExport.import);
const v6ServerPath = resolve(packageDirectory, v6ServerExport.import);
const publicV6Specifier = `${packageJson.name}/sdk-v6`;

const expectedSideEffects = new Set([
  "./index.js",
  "./dist/cjs/**",
  "./dist/esm/**",
  "./dist/v6/esm/server.js",
  "./dist/v6/esm/server.min.js",
]);
const expectedPureAnnotationCount = 152;

function countOccurrences(source, pattern) {
  return source.match(pattern)?.length ?? 0;
}

function pass(message) {
  console.log(`PASS: ${message}`);
}

function testPackageMetadata() {
  assert.deepEqual(
    new Set(packageJson.sideEffects),
    expectedSideEffects,
    "package.json#sideEffects must keep legacy and server artifacts protected without marking the v6 client as side-effectful",
  );
  assert.equal(
    packageJson.exports["./sdk-v6/local-payment-methods"],
    undefined,
    "the removed LPM subpath must not return to the public export map",
  );

  pass("package metadata keeps the intended side-effect and export boundaries");
}

function testPublishedArtifacts() {
  assert.ok(
    existsSync(v6ClientPath),
    `missing v6 client build: ${v6ClientPath}`,
  );
  assert.ok(
    existsSync(v6ServerPath),
    `missing v6 server build: ${v6ServerPath}`,
  );
  assert.equal(
    existsSync(
      resolve(packageDirectory, "dist/v6/esm/local-payment-methods.js"),
    ),
    false,
    "the independent LPM runtime bundle must not be published",
  );

  const clientSource = readFileSync(v6ClientPath, "utf8");
  const serverSource = readFileSync(v6ServerPath, "utf8");

  assert.equal(
    countOccurrences(clientSource, /\/\*#__PURE__\*\//g),
    expectedPureAnnotationCount,
    `the published v6 client must retain all ${expectedPureAnnotationCount} PURE annotations`,
  );
  assert.match(
    serverSource,
    /import\s+["']server-only["'];/,
    "the v6 server build must retain its server-only side effect",
  );

  pass("published v6 artifacts retain PURE annotations and the server guard");
}

async function generateConsumerBundle(exportName) {
  const virtualEntryId = `\0tree-shaking-entry:${exportName}`;
  const bundle = await rollup({
    input: virtualEntryId,
    external: (id) =>
      id === "react" ||
      id === "server-only" ||
      id === "@paypal/paypal-js" ||
      id.startsWith("@paypal/paypal-js/"),
    plugins: [
      {
        name: "v6-tree-shaking-consumer",
        resolveId(source) {
          if (source === virtualEntryId) {
            return virtualEntryId;
          }
          if (source === publicV6Specifier) {
            return v6ClientPath;
          }
          return null;
        },
        load(id) {
          if (id === virtualEntryId) {
            return `export { ${exportName} } from ${JSON.stringify(publicV6Specifier)};`;
          }
          return null;
        },
      },
    ],
    onwarn(warning, defaultHandler) {
      if (
        warning.code === "MODULE_LEVEL_DIRECTIVE" &&
        warning.message.includes('"use client"')
      ) {
        return;
      }
      defaultHandler(warning);
    },
  });

  try {
    const generated = await bundle.generate({ format: "esm" });
    const chunks = generated.output.filter((output) => output.type === "chunk");
    assert.equal(
      chunks.length,
      1,
      "consumer build must generate one JavaScript chunk",
    );
    return chunks[0].code;
  } finally {
    await bundle.close();
  }
}

async function testNonLPMConsumer() {
  const output = await generateConsumerBundle("PayPalOneTimePaymentButton");

  assert.match(output, /PayPalOneTimePaymentButton/);
  assert.doesNotMatch(output, /createLPMButton\(/);
  assert.doesNotMatch(output, /createLPMHook\(/);
  assert.doesNotMatch(output, /createStandaloneLPMButton\(/);
  assert.doesNotMatch(output, /createLPMButtonComponent\(/);
  assert.doesNotMatch(output, /LPMSessionContext/);
  assert.doesNotMatch(output, /\bLPM_REGISTRY\b/);

  pass(
    "a named non-LPM import removes the complete LPM factory and context layer",
  );
}

async function testSingleLPMConsumer() {
  const output = await generateConsumerBundle("IdealOneTimePaymentButton");

  assert.match(output, /IdealOneTimePaymentButton/);
  assert.match(output, /createLPMButton\(/);
  assert.equal(
    countOccurrences(output, /createLPMButton\(/g),
    2,
    "a single named LPM import must retain one factory declaration and one factory call",
  );
  assert.doesNotMatch(output, /createLPMHook\(/);
  assert.doesNotMatch(output, /createStandaloneLPMButton\(/);
  assert.doesNotMatch(output, /createLPMButtonComponent\(/);
  assert.doesNotMatch(output, /LPMSessionContext/);
  assert.doesNotMatch(output, /BancontactOneTimePaymentButton/);

  pass("a single named LPM import removes every unrelated LPM factory call");
}

testPackageMetadata();
testPublishedArtifacts();
await testNonLPMConsumer();
await testSingleLPMConsumer();
