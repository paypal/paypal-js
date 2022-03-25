/* eslint @typescript-eslint/no-var-requires: "off" */

const fs = require("fs");
const filesize = require("filesize");

const maxBundleSizeInKiloBytes = 4;
const maxLegacyBundleSizeInKiloBytes = 7.5;

describe("bundle size", () => {
    it(`paypal-js.min.js should be less than ${maxBundleSizeInKiloBytes} KB`, () => {
        const { size: sizeInBytes } = fs.statSync("dist/iife/paypal-js.min.js");
        const [sizeInKiloBytes] = filesize(sizeInBytes, { output: "array" });

        expect(sizeInKiloBytes).toBeLessThan(maxBundleSizeInKiloBytes);
    });

    it(`paypal-js.legacy.min.js should be less than ${maxLegacyBundleSizeInKiloBytes} KB`, () => {
        const { size: sizeInBytes } = fs.statSync(
            "dist/iife/paypal-js.legacy.min.js"
        );
        const [sizeInKiloBytes] = filesize(sizeInBytes, { output: "array" });

        expect(sizeInKiloBytes).toBeLessThan(maxLegacyBundleSizeInKiloBytes);
    });
});
