import filesize from "filesize";
import fs from "fs";

const maxBundleSizeInKiloBytes = 3.25;
const maxLegacyBundleSizeInKiloBytes = 6.5;

describe("bundle size", () => {
    it(`paypal.browser.min.js should be less than ${maxBundleSizeInKiloBytes} KB`, () => {
        const { size: sizeInBytes } = fs.statSync("dist/paypal.browser.min.js");
        const [sizeInKiloBytes] = filesize(sizeInBytes, { output: "array" });

        expect(sizeInKiloBytes).toBeLessThan(maxBundleSizeInKiloBytes);
    });

    it(`paypal.legacy.browser.min.js should be less than ${maxLegacyBundleSizeInKiloBytes} KB`, () => {
        const { size: sizeInBytes } = fs.statSync(
            "dist/paypal.legacy.browser.min.js"
        );
        const [sizeInKiloBytes] = filesize(sizeInBytes, { output: "array" });

        expect(sizeInKiloBytes).toBeLessThan(maxLegacyBundleSizeInKiloBytes);
    });
});
