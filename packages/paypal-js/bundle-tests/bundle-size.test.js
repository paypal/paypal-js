import { describe, test, expect } from "vitest";
import fs from "fs";
import { filesize } from "filesize";

const maxBundleSizeInKiloBytes = 4;
const maxLegacyBundleSizeInKiloBytes = 7.8;

describe("bundle size", () => {
    test(`paypal-js.min.js should be less than ${maxBundleSizeInKiloBytes} KB`, () => {
        const { size: sizeInBytes } = fs.statSync("dist/iife/paypal-js.min.js");
        const [sizeInKiloBytes] = filesize(sizeInBytes, { output: "array" });

        expect(sizeInKiloBytes).toBeLessThan(maxBundleSizeInKiloBytes);
    });

    test(`paypal-js.legacy.min.js should be less than ${maxLegacyBundleSizeInKiloBytes} KB`, () => {
        const { size: sizeInBytes } = fs.statSync(
            "dist/iife/paypal-js.legacy.min.js",
        );
        const [sizeInKiloBytes] = filesize(sizeInBytes, { output: "array" });

        expect(sizeInKiloBytes).toBeLessThan(maxLegacyBundleSizeInKiloBytes);
    });
});
