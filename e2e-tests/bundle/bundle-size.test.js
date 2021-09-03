import filesize from "filesize";
import fs from "fs";

const maxBundleSizeInKiloBytes = 3.7;
const maxLegacyBundleSizeInKiloBytes = 7.1;

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
