import { describe, test, expect } from "vitest";
import fs from "fs";
import { filesize } from "filesize";

const maxBundleSizeInKiloBytes = 4.5;
const maxLegacyBundleSizeInKiloBytes = 8.2;
const v6MaxBundleSizeInKiloBytes = 2;

describe("bundle size", () => {
    test(`dist/iife/paypal-js.min.js should be less than ${maxBundleSizeInKiloBytes} KB`, () => {
        const { size: sizeInBytes } = fs.statSync("dist/iife/paypal-js.min.js");
        const [sizeInKiloBytes] = filesize(sizeInBytes, { output: "array" });

        expect(sizeInKiloBytes).toBeLessThan(maxBundleSizeInKiloBytes);
    });

    test(`dist/iife/paypal-js.legacy.min.js should be less than ${maxLegacyBundleSizeInKiloBytes} KB`, () => {
        const { size: sizeInBytes } = fs.statSync(
            "dist/iife/paypal-js.legacy.min.js",
        );
        const [sizeInKiloBytes] = filesize(sizeInBytes, { output: "array" });

        expect(sizeInKiloBytes).toBeLessThan(maxLegacyBundleSizeInKiloBytes);
    });

    test(`dist/v6/esm/paypal-js.min.js should be less than ${v6MaxBundleSizeInKiloBytes} KB`, () => {
        const { size: sizeInBytes } = fs.statSync(
            "dist/v6/esm/paypal-js.min.js",
        );
        const [sizeInKiloBytes] = filesize(sizeInBytes, { output: "array" });

        expect(sizeInKiloBytes).toBeLessThan(v6MaxBundleSizeInKiloBytes);
    });
});
